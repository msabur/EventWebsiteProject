import { useState } from 'react';

export function FruitsPage() {
  const [fruitName, setFruitName] = useState('');
  const [fruitDescription, setFruitDescription] = useState('');
  const [fruits, setFruits] = useState([]);

  const handleFruitNameChange = (e) => {
    setFruitName(e.target.value);
  };

  const getFruits = () => {
    fetch('http://localhost:3000/fruits'
    )
      .then((res) => res.json())
      .then((data) => setFruits(data));
  };

  const addFruit = () => {
    fetch('http://localhost:3000/fruits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fruitName,
        description: fruitDescription
      })
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };


  return (
    <div className="App">
      <button onClick={() => getFruits()}>Get Fruits</button>
      <br></br>
      {fruits && fruits != [] ? fruits.map((fruit, i) => {
        return (
          <div key={i}>
            <h3>{fruit.name}</h3>
            <p>{fruit.description}</p>
          </div>
        );
      }) : <></>}
      <br></br>
      <label>Fruit name: </label>
      <input type="text" value={fruitName} onChange={handleFruitNameChange} />
      <br></br>
      <label>Fruit description: </label>
      <input type="text" value={fruitDescription} onChange={(e) => setFruitDescription(e.target.value)} />
      <br></br>
      <button onClick={() => addFruit()}> Add fruit </button>
    </div>
  );
}
