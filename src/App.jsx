import UserList from "./features/users/UserList";

function App() {
  return (
    <div className="app">
      <h1>SWP React Frontend</h1>
      <p>Frontend gọi backend Node.js bằng Redux Saga</p>

      <UserList />
    </div>
  );
}

export default App;