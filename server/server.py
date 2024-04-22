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

# Used when returning values from the api. This table should be the same as the one found in the website's javascript code. Keeps the variable names organized and consistent between the backend and frontend.
api_variable_names = {
    "data": "data",
    "idi": "idi",
    "kIndex": "ki",
    "elbowindex": "ei",
    "sumSquaredLoadings": "ssl",
    "projectedPoints": "pp",
    "eigenValues": "ev",
    "varianceExplained": "ve",
    "eigenVectors": "ev",
    "listOfMSE": "mse",
    "labels": "labels",
    "dataMDS": "dataMDS",
    "varMDS": "varMDS",
    "corMatrix": "corMatrix"
}


# This class holds data to reduce data transfered between front end and backend
class MyData:
    def __init__(self):
        self.data = []
        self.idi = -1
        self.k = -1
        self.elbowIndex = -1
        self.sumSquaredLoadings = []
        self.projectedPoints = []
        self.eigenValues = []
        self.varianceExplained = []
        self.eigenVectors = []
        self.listOfMSE = []
        self.labels = []
        self.dataMDSCoordinates = []
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


# Gets data from the file and puts it in a list
def retrieveRawData(targetData, attribute):
    print("type(targetData): ", type(targetData))
    print("attribute: ",str(attribute))
    print("targetData: ",str(targetData))
    print("targetData.columns: ",str(targetData.columns))
    print("targetData.get(attribute): ",str(targetData.get(attribute)))
    print("targetData.get(attribute).tolist(): ",str(targetData.get(attribute).tolist()))
    return targetData.get(attribute).tolist()


# Uses PCA to calculate the variance explained
def calculateVarianceExplained():
    data = myDataObj.data
    np_array = np.array(data)
    pca = PCA(n_components=len(data[0]))
    pca.fit(np_array)
    myDataObj.varianceExplained = pca.explained_variance_ratio_.tolist()


# Normalizes the data then calculates the MSE for an 'nClusters' amount of clusters
def calculateMSE(nClusters):
    x_array = np.array(myDataObj.data)
    min_vals = np.min(x_array, axis=1, keepdims=True)
    max_vals = np.max(x_array, axis=1, keepdims=True)
    normalized_data = (x_array - min_vals) / (max_vals - min_vals)
    kmeans = KMeans(n_clusters=nClusters, random_state=42)
    kmeans.fit(normalized_data)
    return kmeans.inertia_


# Gets the list of MSE value for a cumulative amount of clusters
def getMSEList():
    data = myDataObj.data
    mse_list = []
    for n in range(1, len(data[0]) + 1):
        mse = calculateMSE(n)
        mse_list.append(mse)
    myDataObj.listOfMSE = mse_list


# This method first gets the list of mse values, then uses that list to find the elbow
def calculateElbowIndex():
    data = myDataObj.data
    listOfMSEValues = []
    # Getting list of mse values
    for i in range(1, 13):
        kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)
        kmeans.fit(data)
        listOfMSEValues.append(kmeans.inertia_)
    # Finding elbow
    x = np.arange(1, len(listOfMSEValues) + 1)
    kneedle = KneeLocator(x, listOfMSEValues, curve='convex', direction='decreasing')
    myDataObj.elbowIndex = int(kneedle.elbow)


# Projects the points to domain and range [-1,1]
def CalculateProjectedPoints(pc1Index=0, pc2Index=1):
    npArrData = np.array(myDataObj.data)
    pca = PCA(n_components=len(myDataObj.data[0]))
    transformed_data = pca.fit_transform(npArrData)
    firstPC = transformed_data[:, pc1Index]
    secondPC = transformed_data[:, pc2Index]
    dimensionality_list = [[firstPC[i], secondPC[i]] for i in range(len(firstPC))]
    myDataObj.projectedPoints = dimensionality_list
    # Scale the transformed data to [-1, 1] range using dimensionality_list
    scaled_data = np.array(dimensionality_list) / np.max(np.abs(dimensionality_list))
    myDataObj.projectedPoints = scaled_data.tolist()


# Gets eigenvectors of pcs
def computeEigenVectors():
    data = myDataObj.data
    np_array = np.array(data)
    pca = PCA(n_components=len(data[0]))
    pca.fit(np_array)
    myDataObj.eigenVectors = pca.components_.tolist()


# Gets the labels
def calculateLabels():
    data = myDataObj.data
    input_data = np.array(data)
    kmeans = KMeans(n_clusters=myDataObj.k, random_state=42)
    kmeans.fit(input_data)
    myDataObj.labels = kmeans.labels_.tolist()


# Computes the sum squared loadings
def calculateSumSquaredLoadings(eigenvectors):
    if (myDataObj.idi == -1): myDataObj.idi = 12
    sum_squared_loadings = []
    for row in eigenvectors:
        tempsum = 0
        for index, col in enumerate(row):
            if (index <= myDataObj.idi):
                tempsum = tempsum + (col * col)
            else:
                continue
        sum_squared_loadings.append(math.sqrt(tempsum))
    myDataObj.sumSquaredLoadings = sum_squared_loadings


def CalculateDataMDS():
    mds = MDS(n_components=2, metric=True)

    X_transformed = mds.fit_transform(myDataObj.data)
    myDataObj.dataMDSCoordinates = X_transformed.tolist()


def calculateVariableMDS():
    numArray = [list(map(lambda l: l[i], myDataObj.data)) for i in range(len(myDataObj.data[0]))]
    correlation_matrix = np.corrcoef(numArray)

    # Compute dissimilarity matrix
    dissimilarity_matrix = 1 - np.abs(correlation_matrix)

    # Use MDS with the dissimilarity matrix
    mds = MDS(n_components=2, metric=True, dissimilarity='precomputed')
    X_transformed = mds.fit_transform(dissimilarity_matrix)
    myDataObj.varMDSCoordinates = X_transformed.tolist()
    myDataObj.corMatrix = correlation_matrix.tolist()


# Performs initial calculations that will be needed by the website
def performInitialCalculations(data):
    myDataObj.data = data
    calculateElbowIndex()
    myDataObj.idi = myDataObj.elbowIndex
    myDataObj.k = myDataObj.elbowIndex
    calculateVarianceExplained()
    getMSEList()
    CalculateProjectedPoints()
    computeEigenVectors()
    calculateSumSquaredLoadings(myDataObj.eigenVectors)
    calculateLabels()


@app.post('/getRawData')
async def getRawData(os: OneString):
    rawdata = retrieveRawData(data, os)
    return {"rawdata" : rawdata}


# Gets all the data needed at startup
@app.post('/postInitialStats/')
async def postInitialStats(jd: JustData):
    performInitialCalculations(jd.data)
    return {api_variable_names["idi"]: myDataObj.idi, api_variable_names["kIndex"]: myDataObj.k,
            api_variable_names["varianceExplained"]: myDataObj.varianceExplained,
            api_variable_names["listOfMSE"]: myDataObj.listOfMSE,
            api_variable_names["elbowindex"]: myDataObj.elbowIndex,
            api_variable_names["projectedPoints"]: myDataObj.projectedPoints,
            api_variable_names["eigenVectors"]: myDataObj.eigenVectors,
            api_variable_names["sumSquaredLoadings"]: myDataObj.sumSquaredLoadings,
            api_variable_names["labels"]: myDataObj.labels}


# Gets the list of labels
@app.get('/getLabels/')
async def getLabels():
    return {api_variable_names["labels"]: myDataObj.labels}


# Updates the value of intrinsic dimensionality index and returns data needed to make the table and scatter matrix
@app.post('/updateIdi/')
async def updateIdi(ji: JustInt):
    myDataObj.idi = ji.value
    calculateSumSquaredLoadings(myDataObj.eigenVectors)
    calculateLabels()
    return {api_variable_names["eigenVectors"]: myDataObj.eigenVectors,
            api_variable_names["sumSquaredLoadings"]: myDataObj.sumSquaredLoadings,
            api_variable_names["idi"]: myDataObj.idi, api_variable_names["data"]: myDataObj.data,
            api_variable_names["labels"]: myDataObj.labels}


# Updates the value of k and returns data needed to make the biplot and scatter matrix
@app.post('/updateK/')
async def updateK(ji: JustInt):
    myDataObj.k = ji.value
    calculateLabels()
    return {api_variable_names["eigenVectors"]: myDataObj.eigenVectors, api_variable_names["labels"]: myDataObj.labels,
            api_variable_names["projectedPoints"]: myDataObj.projectedPoints,
            api_variable_names["data"]: myDataObj.data,
            api_variable_names["sumSquaredLoadings"]: myDataObj.sumSquaredLoadings}


# After new pcs are selected on website, new projected points will need to be calculated. Returns data needed to make a biplot
@app.post('/biPlotInfo/')
async def getBiPlotInfo(ti: TwoInt):
    CalculateProjectedPoints(ti.value1, ti.value2)
    return {api_variable_names["eigenVectors"]: myDataObj.eigenVectors, api_variable_names["labels"]: myDataObj.labels,
            api_variable_names["projectedPoints"]: myDataObj.projectedPoints}


@app.get('/initializeDataMDS/')
async def initializeDataMDSPoints():
    CalculateDataMDS()
    return {api_variable_names["dataMDS"]: myDataObj.dataMDSCoordinates}


@app.get('/getDataMDS/')
async def getDataMDSPoints():
    return {api_variable_names["dataMDS"]: myDataObj.dataMDSCoordinates}


@app.get('/initializeVarMDS/')
async def initializeVarMDSPoints():
    calculateVariableMDS()
    return {api_variable_names["varMDS"]: myDataObj.varMDSCoordinates,
            api_variable_names["corMatrix"]: myDataObj.corMatrix}


@app.get('/getVarMDS/')
async def getVarMDSPoints():
    return {api_variable_names["varMDS"]: myDataObj.varMDSCoordinates,
            api_variable_names["corMatrix"]: myDataObj.corMatrix}
