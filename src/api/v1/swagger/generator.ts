import fs from 'fs';
import path from 'path';

const uri = path.join(__dirname, '../routes/admin/adminRouter.js');
const data = '';
const readStream = fs.createReadStream(uri, 'utf8');
readStream.on('data', (chunk) => {
    //console.log(chunk);
}).on('end', () => {
    //console.log(data);
});
