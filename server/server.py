from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import math
from kneed import KneeLocator
from sklearn.manifold import MDS

app = FastAPI()

data = pd.read_json("visDataset.json")
vooData = pd.read_json("vooData.json")

# Used when returning values from the api. This table should be the same as the one found in the website's javascript code. Keeps the variable names organized and consistent between the backend and frontend.
api_variable_names = {
    "data": "data",
    "vooData": "vd",
    "numericalData":"nd",
    "rawData":"rd",
    "categoryNames":'cn',
    "kIndex": "ki",
    "elbowindex": "ei",
    "listOfMSE": "mse",
    "labels": "labels",
    "varMDS": "varMDS",
    "corMatrix": "corMatrix"
}


# This class holds data to reduce data transfered between front end and backend
class MyData:
    def __init__(self):
        self.data = []
        self.vooData = []
        #Holds numerical data only
        self.numericalData = []
        self.k = -1
        self.elbowIndex = -1
        self.listOfMSE = []
        self.labels = []
        self.varMDSCoordinates = []
        self.corMatrix = []


# The object that holds the data
myDataObj = MyData()


# API class meant for transfering the list of data
class JustData(BaseModel):
    data: list[list[float]]


# API class meant for transfering one value
class JustInt(BaseModel):
    value: int


# API class meant for transfering two values
class TwoInt(BaseModel):
    value1: int
    value2: int


class OneString(BaseModel):
    value: str

class OneList(BaseModel):
    list: list

def getData():
    list_of_lists = []
    for _, row in data.iterrows():
        inner_list = []
        for column in data.columns:
            inner_list.append(row[column])
        list_of_lists.append(inner_list)
    return list_of_lists

def getVooData():
    list_of_lists = []
    for _, row in vooData.iterrows():
        inner_list = []
        for column in vooData.columns:
            inner_list.append(row[column])
        list_of_lists.append(inner_list)
    return list_of_lists

# Creates a list of numerical values
def getNumericList():
    exclude_attributes = ["Ticker","Date"]
    list_of_lists = []
    for _, row in data.iterrows():
        inner_list = []
        for column in data.columns:
            if column not in exclude_attributes:
                inner_list.append(row[column])
        list_of_lists.append(inner_list)
    return list_of_lists

# Gets data from the file and puts it in a list
def retrieveRawData(targetData, attribute):
    return targetData.get(attribute).tolist()

def retrieveRawDataForManyAttributes(targetData,attribute):
    # Initialize an empty list to store the results
    data_list = []

    # Iterate over each row in the DataFrame
    for _, row in targetData.iterrows():
        tempList = []
        for attr in attribute:
            # Extract the desired attributes from the current row
            tempList.append(row[attr])
        # Append the attributes as a list to the main list
        data_list.append(tempList)
    # Return the resulting list
    return data_list


# Normalizes the data then calculates the MSE for an 'nClusters' amount of clusters
def calculateMSE(nClusters):
    x_array = np.array(myDataObj.numericalData)
    min_vals = np.min(x_array, axis=1, keepdims=True)
    max_vals = np.max(x_array, axis=1, keepdims=True)
    normalized_data = (x_array - min_vals) / (max_vals - min_vals)
    kmeans = KMeans(n_clusters=nClusters, random_state=42)
    kmeans.fit(normalized_data)
    return kmeans.inertia_


# Gets the list of MSE value for a cumulative amount of clusters
def getMSEList():
    mse_list = []
    for n in range(1, len(myDataObj.numericalData[0]) + 1):
        mse = calculateMSE(n)
        mse_list.append(mse)
    myDataObj.listOfMSE = mse_list


# This method first gets the list of mse values, then uses that list to find the elbow
def calculateElbowIndex():
    listOfMSEValues = []
    # Getting list of mse values
    for i in range(1, len(myDataObj.numericalData[0]) + 1):
        kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)
        kmeans.fit(myDataObj.numericalData)
        listOfMSEValues.append(kmeans.inertia_)
    # Finding elbow
    x = np.arange(1, len(listOfMSEValues) + 1)
    kneedle = KneeLocator(x, listOfMSEValues, curve='convex', direction='decreasing')
    myDataObj.elbowIndex = int(kneedle.elbow)



# Gets the labels
def calculateLabels():
    input_data = np.array(myDataObj.numericalData)
    kmeans = KMeans(n_clusters=myDataObj.k, random_state=42)
    kmeans.fit(input_data)
    myDataObj.labels = kmeans.labels_.tolist()


def calculateVariableMDS():
    # Transposing data
    numArray = [list(map(lambda l: l[i], myDataObj.numericalData)) for i in range(len(myDataObj.numericalData[0]))]
    correlation_matrix = np.corrcoef(numArray)

    # Compute dissimilarity matrix
    dissimilarity_matrix = 1 - np.abs(correlation_matrix)

    # Use MDS with the dissimilarity matrix
    mds = MDS(n_components=2, metric=True, dissimilarity='precomputed')
    X_transformed = mds.fit_transform(dissimilarity_matrix)
    myDataObj.varMDSCoordinates = X_transformed.tolist()
    myDataObj.corMatrix = correlation_matrix.tolist()


# Performs initial calculations that will be needed by the website
def performInitialCalculations():
    myDataObj.data = getData()
    myDataObj.vooData = getVooData()
    #Initialize numeric data
    myDataObj.numericalData = getNumericList()
    calculateElbowIndex()
    myDataObj.k = myDataObj.elbowIndex
    getMSEList()
    calculateLabels()


@app.post('/api/getRawData')
async def getRawData(os: OneString):
    rawdata = retrieveRawData(data, os.value)
    return {api_variable_names["rawData"]: rawdata}

@app.post('/api/getRawDataForManyAttributes')
async def getRawDataForManyAttributes(ol: OneList):
    rawdata = retrieveRawDataForManyAttributes(data, ol.list)
    return {api_variable_names["rawData"] : rawdata}


# Gets all the data needed at startup
@app.get('/api/getInitialStats/')
async def getInitialStats():
    performInitialCalculations()
    calculateVariableMDS()
    return {api_variable_names["categoryNames"]:data.columns.tolist(),
            api_variable_names["data"]:myDataObj.data,
            api_variable_names["vooData"]:myDataObj.vooData,
            api_variable_names["kIndex"]: myDataObj.k,
            api_variable_names["elbowindex"]: myDataObj.elbowIndex,
            api_variable_names["labels"]: myDataObj.labels,
            api_variable_names["varMDS"]: myDataObj.varMDSCoordinates}



# Gets the list of labels
@app.get('/api/getLabels/')
async def getLabels():
    return {api_variable_names["labels"]: myDataObj.labels}

# Updates the value of k and returns data needed to make the biplot and scatter matrix
@app.post('/api/updateK/')
async def updateK(ji: JustInt):
    myDataObj.k = ji.value
    calculateLabels()
    return {api_variable_names["labels"]: myDataObj.labels}

'''
@app.get('/api/initializeVarMDS/')
async def initializeVarMDSPoints():
    calculateVariableMDS()
    return {api_variable_names["varMDS"]: myDataObj.varMDSCoordinates,
            api_variable_names["corMatrix"]: myDataObj.corMatrix}
'''


@app.get('/api/getVarMDS/')
async def getVarMDSPoints():
    return {api_variable_names["varMDS"]: myDataObj.varMDSCoordinates,
            api_variable_names["corMatrix"]: myDataObj.corMatrix}
