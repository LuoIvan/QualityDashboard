let express = require('express');

let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
let apiRouter = require('./routes/api');


app.use('/api', apiRouter);
app.use('/public', express.static('public'));


app.listen(5438, function () {
    console.log("启动服务 http://localhost:5438 ")
});

