
import { Authenticator, Tabs } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import CrudTable from './components/CrudTable';
// import Navigation from './components/Navigation';
// import CrudTable from './components/CrudTable';


// const client = generateClient<Schema>();

function App() {
  // const [todos, setTodos] = useState<Array<Schema["Thought"]["type"]>>([]);

  // useEffect(() => {
  //   client.models.Thought.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

    
  // function deleteTodo(id: string) {
  //   client.models.Thought.delete({ id })
  // }

  // function createTodo() {
  //   client.models.Thought.create({ author: window.prompt("author content") , text: window.prompt("text content") });
  // }
  
  return (
    <Authenticator>
        <div className="header-container">
          <Header title="My Amplify App" />
        </div>

      <Tabs
        justifyContent="flex-start"
        defaultValue='Tab 1'
        items={[
          { label: 'Tab 1', value: 'Tab 1', content: <CrudTable /> },
          { label: 'Tab 2', value: 'Tab 2', content: 'Tab content #2' },
        ]}
      />
    </Authenticator>
  );
  
}

export default App;


/*

    // {({ signOut, user }) => (
    // <main>
    //   <h1>{user?.signInDetails?.loginId}'s todos</h1>      
    //   <h1>My todos</h1>
    //   <button onClick={createTodo}>+ new</button>
    //   <ul>
    //     {todos.map((todo) => (
    //       <li 
    //       onClick={() => deleteTodo(todo.id)}          
    //       key={todo.id}>{todo.author} - {todo.text}</li>
    //     ))}
    //   </ul>
    //   <div>
    //     🥳 App successfully hosted. Try creating a new todo.
    //     <br />
    //     <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
    //       Review next step of this tutorial.
    //     </a>
    //   </div>
    //   <button onClick={signOut}>Sign out</button>
    // </main>
    // )}
    */