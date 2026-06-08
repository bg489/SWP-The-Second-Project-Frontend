import React from 'react';
import VehicleList from './features/users/vehicles/VehicleList'; // Đường dẫn đến file danh sách xe
import './App.css';

function App() {
  return (
    <div id="center">
      {/* Ép ứng dụng gọi thẳng danh sách xe, không thông qua login nữa */}
      <VehicleList />
    </div>
  );
}

export default App;