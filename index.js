const express = require('express')
require("@babel/core").transform("code", {
    presets: ["@babel/preset-env"],
});
var shell = require('shelljs');
var fs = require('fs');


const app = express();
// app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const router = express.Router()

const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:3000',
        "http://127.0.0.1:3000",
        'https://lalasol-bootcamp.web.app',
        'https://unpkg.com'
    ]
}));



app.use('/', router)


router.get('/', (req, res) => {
    res.send('<h1>Welcome to LaLaSol JS Shell Server</h1>')
})
router.get('/demo/myCar', (req, res) => {
    res.send('<h1>Welcome to LaLaSol JS Shell Server</h1>')
})




/** -- Run pure javascript and return result from node test.js */
router.post('/api/', (req, res) => {
    const jscode = req.body['js-code']//JSON.parse(req.body)
    console.log(req.body, jscode)
    if (jscode) {
        if (!req.body.user || !req.body.id) return res.send('error: bad data')
        const fileName = `${req.body.user}-${req.body.id}.js`
        fs.writeFile(fileName, jscode, function (err) {
            if (err) {
                // console.log('error: ', err)
                res.send(JSON.stringify(err))
                return;
            }
            // console.log('Saved!');
            try {
                const output = shell.exec(`timeout 10 node ${fileName}`, function (code, stdout, stderr) {
                    console.log('Exit code:', code);
                    if (code == 0) {
                        res.send(JSON.stringify(stdout))
                        // console.log('Program output:', stdout);
                    }
                    else if (code == 1) {
                        // console.log('Program stderr:', stderr);
                        res.send(JSON.stringify(stderr))
                    }
                    else if (code == 124) {
                        // console.log('Program stderr:', stderr);
                        res.send('You might have infinite loop.')
                    }
                    else {
                        res.send(JSON.stringify(stderr))
                    }
                    /** Delete file */
                    fs.unlink(fileName, function (err) {
                        if (err) throw err;
                    });
                });
            }
            catch (e) {
                console.log('error:', e)
                res.send(JSON.stringify(e))
            }
        })

    }
    else {
        res.send("<h1>Input Error</h1>")
    }


})

/** Create html file from post request ans save it in server */
router.post('/api-html/', (req, res) => {
    const htmlCode = req.body['html-code']
    // console.log(req.body, htmlCode)
    if (htmlCode) {
        if (!req.body.user || !req.body.id) return res.send('error: bad data')
        // const fileName = `${req.body.user}-${req.body.id}.html`
        // fs.writeFile(fileName, htmlCode, function (err) {
        //     if (err) {
        //         // console.log('error: ', err)
        //         res.send(JSON.stringify(err))
        //         return;
        //     }
        //     res.send(`${htmlCode}`)

        // })
        res.send(`${htmlCode}`)

    }
    else {
        res.send("<h1>Input Error</h1>")
    }


})
/** 
 * Read the file that was created from POST request and send file to client by GET request
 * e.g.://localhost:5000/get-html/?email=t1@gmail.com&id=1
 */
router.get('/get-html', (req, res) => {

    if (req.query.email && req.query.id) {
        fs.readFile(`${req.query.email}-${req.query.id}.html`, 'utf8', function read(err, data) {
            if (err) {
                // throw err;
                res.send('<h1>Sorry No Page</h1>')
            }
            // console.log('file-data', data)
            res.send(data)
        });
    }
    else res.send('<h1>Sorry no parameters</h1>')


})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server runs on port ${PORT}`))
