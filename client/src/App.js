import './App.css';
import AttributeMDS from './Components/AttributeMDS/AttributeMDS';
import Pcp from './Components/PCPcomponent/Pcp';

function App() {
  return (
    <>
      <div className="container">
        <div className="top-row">
          {/* Line plot */}
          <div className="box">Div 1</div>
          {/* Candle plot */}
          <div className="box">Div 2</div>
          {/* Scatter plot */}
          <div className="box">Div 3</div>
        </div>
        <div className="bottom-row">
          {/* PCP */}
          <div className="big-box">
            <Pcp/>
          </div>
          {/* Attribute MDS */}
          <div className="box">
            <AttributeMDS/>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
