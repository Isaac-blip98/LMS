const axios = require('axios');

async function testInstructorAPI() {
  try {
    // First, login as admin to get a token
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'itsbrian2025@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('Admin token obtained');
    
    // Test getting all users
    const allUsersResponse = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('All users:', allUsersResponse.data.length);
    
    // Test getting only instructors
    const instructorsResponse = await axios.get('http://localhost:3000/users?role=INSTRUCTOR', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Instructors found:', instructorsResponse.data.length);
    console.log('Instructors:', instructorsResponse.data.map(u => ({ id: u.id, name: u.name, role: u.role })));
    
    // Test getting only students
    const studentsResponse = await axios.get('http://localhost:3000/users?role=STUDENT', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Students found:', studentsResponse.data.length);
    
    // Test getting only admins
    const adminsResponse = await axios.get('http://localhost:3000/users?role=ADMIN', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Admins found:', adminsResponse.data.length);
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testInstructorAPI(); 