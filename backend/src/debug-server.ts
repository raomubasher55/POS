import 'dotenv/config';

console.log('Starting debug server...');

try {
  console.log('Environment variables:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('PORT:', process.env.PORT);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

  // Test imports
  console.log('Testing imports...');
  
  import('./server').then(() => {
    console.log('Server imported successfully');
  }).catch(err => {
    console.error('Server import error:', err);
  });

} catch (error) {
  console.error('Debug server error:', error);
}