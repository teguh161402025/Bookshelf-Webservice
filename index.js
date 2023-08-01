const express = require('express');
const app = express();
const port = 9000;
const fs = require('fs')
let database;
app.use(express.json());
fs.readFile('database.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Gagal membaca file JSON:', err);
    }
    else {
        try {
            database = JSON.parse(data);

        }
        catch (err) {
            console.error('Gagal parsing data JSON:', err);
            res.status(500).json({ error: 'Terjadi kesalahan server' });
        }
    }
});

function generateId() {
    const min = 1000;
    const max = 9999;


    const randomNumber = Math.floor(Math.random() * (max - min) + min);

    return randomNumber;
}

function saveToDatabase(data) {

    fs.writeFile('database.json', JSON.stringify(data), err => {
        if (err) {
            console.log("GAGAL MENYIMPAN", err);
        }
        else {
            console.log("BERHASIL MENYIMPAN");
        }
    })
}

app.get('/books', (req, res) => {

    const finishedParam = req.query.finished;

    if (finishedParam === '0') {
        const unfinishedBooks = database['books'].filter(a => a.reading);
        res.json(unfinishedBooks);
    } else if (finishedParam === '1') {
        const finishedBooks = database['books'].filter(a => !a.reading);
        res.json(finishedBooks);
    } else {
        const data = database;
        res.status(200).json({
            "status": "success",
            "data": {
                "books": data['books'].map(a => ({
                    "id": a.id,
                    "name": a.name,
                    "publisher": a.publisher


                })
                )
            }
        })
    }

});

app.get('/books/:id', (req, res) => {
    const id = req.params.id;
    const book = database['books'].find(a => a.id == id);

    if (!book) {
        res.status(404).json({
            "status": "fail",
            "message": "Buku tidak ditemukan"
        })
    }
    else {

        res.status(200).json({
            "status": "success",
            "data": {
                "book": book
            }
        })
    }



});

app.post('/books', (req, res) => {

    const newData = req.body;
    if ('name' in newData) {
        if (newData.readPage <= newData.pageCount) {
            newData.id = generateId();
            newData.insertedAt = new Date();
            newData.updatedAt = new Date()
            console.log(newData);

            if (newData.pageCount !== newData.readPage) {
                newData.finished = false;
            }
            else {
                newData.finished = true;
            }

            database['books'].push(newData);
            console.log(database);
            saveToDatabase(database);
            res.status(201).json({
                "status": "success",
                "message": "Buku berhasil ditambahkan",
                "data": {
                    "bookId": newData.id
                }
            });
        }
        else {
            res.status(400).json({
                "status": "fail",
                "message": "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
            })
        }
    }
    else {
        res.status(400).json({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
    }
})

app.put('/books/:id', (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    const book = database['books'].find(a => a.id == id);
    const index = database['books'].findIndex(a => a.id == id);
    console.log(index);
    console.log(id)

    if (index == null || book == null) {
        res.status(404).json({

            "status": "fail",
            "message": "Gagal memperbarui buku. Id tidak ditemukan"

        })
    }
    else {
        if ('name' in newData) {
            if (newData.readPage <= newData.pageCount) {
                if (newData.pageCount !== newData.readPage) {
                    newData.finished = false;
                }
                else {
                    newData.finished = true;
                }
                database['books'][index] = {
                    ...newData, "id": parseInt(id), "updatedAt": new Date(), "insertedAt": new Date()
                };



                saveToDatabase(database);
                res.status(200).json({
                    "status": "success",
                    "message": "Buku berhasil diperbarui"
                })
            }
            else {
                res.status(400).json({
                    "status": "fail",
                    "message": "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
                })
            }
        }
        else {
            res.status(400).json({
                "status": "fail",
                "message": "Gagal memperbarui buku. Mohon isi nama buku"
            })
        }
    }
})

app.delete('/books/:id', (req, res) => {
    const id = req.params.id;
    const book = database['books'].find(a => a.id == id);
    const index = database['books'].findIndex(a => a.id !== id);
    console.log(index);
    if (index >= 0) {
        database['books'].splice(index, 1);
        saveToDatabase(database);
        res.status(200).json({
            "status": "succes",
            "message": "Buku berhasil Dihapus"
        })
    }
    else {
        res.status(404).json({
            "status": "fail",
            "message": "Buku gagal dihapus. Id tidak ditemukan"
        })
    }
})
app.listen(port, () => {
    console.log('SERVER BERJALAN PADA PORT 9000')
});
