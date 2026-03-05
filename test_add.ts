
import axios from 'axios';

async function testAdd() {
  try {
    const res = await axios.post('http://localhost:3000/api/finished-products', {
      name: 'Test Product ' + Date.now(),
      hsnCode: '1234',
      gstPercentage: 18,
      retailPrice: 100,
      wholesalePrice: 80,
      privateLabelPrice: 70,
      expiryDurationMonths: 12
    });
    console.log('Added:', res.data);
    
    const list = await axios.get('http://localhost:3000/api/finished-products');
    console.log('List count:', list.data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAdd();
