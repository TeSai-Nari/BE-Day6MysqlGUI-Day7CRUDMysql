//................0.1. Info.....................
/* Baca terlebih dahulu day6.doc di Ms.Word*/
/* Install--> npm i body-parser express mysql*/
/* Install--> npm i cors(nanti waktu buat react)*/

var bodyparser  = require ('body-parser');
var express     = require ('express');
var app         = express ();
var mysql       = require ('mysql') ;                   // Menghubungkan node.js ke mysql (data dr mysql bisa didapatkan)
var cors        = require ('cors')
var PORT        = 5000;

app.use(cors())                                         // Urutannya harus Diatas semua APP. Memungkinkan SEMUA orang u/akses back-end (ada yg untuk web sendiri)
app.use(bodyparser.json());                             // Buat user kirim data ke server 
app.use(bodyparser.urlencoded({extended:false}));       // Buat user kirim data ke server 

//Day 6................Menyambungkan back-end ke MySQL.....................

const db=mysql.createConnection({                       // Menyambungkan dg mysql.createConnection (obj)
    host    :'localhost',                                   // Isi sesuai data mysql workbench
    user    :'tesai',
    password:'Jesusnumber1!',
    database:'hokijc12',                                // Pilih database
    port    :'3306'
/*^*///multipleStatements: true                         // bisa true / false, berfungsi u/ membuat lbh dari 1 query
})

db.connect ((err) => {
    if(err) return console.log(err)                     // Kalau if hanya 1 baris, bisa dipersingkat tak usah pakai {}
    console.log('berhasil sudah')                       // Di tahap ini, masuk ke teriminal--> nodemon .
})
app.get('/allusers',(req,res) => {
    /*^*/db.query('select * from pengguna',(err,result)=>{   // param pertama isi query-nya (cara tulis mysql), param ke-2, call back, result dr db.query
        if(err) return res.status(500).send(err)             // kalau if hanya 1 baris, bisa dipersingkat tak usah pakai {}
        return res.status(200).send(result)
    })           
})
/*^*/
/* 
1. Kalau di workbench, secara umum dibawahnya ada query lain (select * from cart, select * from product dll)
2. Kalau mau lebih dari 1 query, di bagian mysql.createConnection ditambah dengan
        multiStatements: true / false
            (key)          (value)
3. Tapi bisa terjadi yang namanya sql injection (rawan di-hacking) makanya hanya dimasukkan 1 query (/ syntax / perintah)
4. Nanti pakai promise, kalau syntaxnya sudah agak ribet.
5. 'select * from pengguna' merupakan 1 statement, tak usah pakai titik koma (;)

 
 */
//Day 7................CRUD MYSQL.....................
//Kalau mau CRUD, hanya diubah isi statement query-nya
//Gunanya tanda tanya untuk menghindari sql injection
// Kalau mau edit--> update
//           delete--> delete
//           create--> insert

/* .....................................Mendapatkan user dengan id tertentu............................................*/
app.get('/users',(req,res )=> {                                       // waktu return res.send(result), tulis di urlnya: localhost:5000/users?username=sasuke&password=taka
    const {username,password}=req.query                             

    /*Cara 1 (comment salah satu) */
    var sql = `select * from pengguna where username='${username}' and password ='${password}'`
    db.query(sql,(err,result) =>{                                    // perlu query (bukan param krn butuh username & password)
        if(err) return res.status(500).send(err)
        return res.status(200).send(result[0])                      // karena hasilnya berupa array of obj & hanya ada 1. Maka yg tadinya result -->result[0]
    })
    /*Cara 2: versi tanda tanya */
    // var sql =  'select * from pengguna where username = ? and password = ?' // Spesial khusus mysql pakai tanda tanya
    // db.query(sql,[username,password],(err,result)=>{                        // Di param ke 2 masukkin req.query-nya. Disesuaikan dengan urutan tanda tanya-nya            
    //     if(err) return res.status(500).send(err)
    //     return res.status(200).send(result[0])                              // Hasil idem dg cara 1. Penjelasan idem dg cara 1
    // })                      
})
/* .....................................Menambah user............................................*/
//cara day3
// app.post('/products',(req,res)=>{                                       // mau nge-post(tambah) data. Nama '/products' tak papa sama krn method beda (1 di .post, 1 di .get)                            
//     arrprod.push({...req.body, id: arrprod.length+1})                   // balik lagi ke post.man, masukin username & passwordnya lagi   
//     res.send(arrprod)
// })
app.post('/users',(req,res)=>{                                              // Ingat kalau post harus pakai postman
    var {username,password}=req.body
    // Cara 1
    // var sqlpost1= `insert into pengguna (username,password) values('${username}','${password}')`
    // db.query(sqlpost1,(err,result)=>{                                    // Query dalam query
    //     if(err) return res.status(500).send(err)                         // dibawahnya belum ada yg res.status(200).send(result)
    //     db.query('select * from pengguna',(err,result1)=>{
    //         if(err) return res.status(500).send(err)
    //         return res.status(200).send(result1)                         // Gak papa kalau param 'result' tak ada

    //     })                                                   
    // })

    // Cara 2 tanda tanya
    var sqlpost2='insert into pengguna set ?'                         // Main logika. Kalau insert, maka yang diminta itu isinya berupa obj
    if(username=='' || password==''){                                 // Ignore. Nanti kalau udah buka react. Baca: username / passwordnya kosong..
        return res.status(500).send('input datanya, coy')             // ...status 500 sdh lsg masuk ke. catch
    }                                                                 // INGAT! if(username=='' dst)= destructuring dr atas-> req.body.username
    
    db.query(sqlpost2,req.body,(err,result)=>{                        // req.body itu adalah... objek, tak usah pakai kurung {} lagi
        if(err) return res.status(500).send(err)
        db.query('select * from pengguna',(err,result1)=>{
            if(err) return res.status(500).send(err)
            return res.status(200).send(result1)
        })
    })
})
/* .....................................Edit(update) user............................................*/
// Cara day3
// app.put('/users/:id',(req,res)=>{                                  // mau edit, perlu id (baca: user dg id berapa yg mau diedit)
//     users[req.params.id-1]={...users[req.params.id-1],...req.body} // ingat dino= array ke-0, krn incar id=1(contohnya) untuk disamaain, kurang 1                                       
// /*--*/res.send(users)                                              // di postman, ubah POST jadi PUT
// })

// Cara 1
app.put('/users/:id',(req,res)=>{                                     // Kalau pakai cara 1, mau tak mau username & password harus di-isi
    var {id} = req.params
    var {username,password} = req.body
    // var sqledit1= `update pengguna set username='${username}',password='${password}' where id=${id}`
    // db.query(sqledit1,(err,result)=>{
    //     if(err) return res.status(500).send(err)
    //     db.query('select * from pengguna',(err,res1)=>{
    //         if(err) return res.status(500).send(err)
    //         return res.status(200).send(result)
    //     })
    // })                                                             // Setelah selesai, pergi ke Postman, isi, di url pilih id no berapa(http://localhost:5000/users/10), send             

// Cara 2 tanda tanya

    var sqledit2=`update pengguna set ? where id = ${id}`
    db.query(sqledit2,req.body,(err,result)=>{
        if(err) return res.status(500).send(err)
        db.query('select * from pengguna',(err,res1)=>{
            if(err) return res.status(500).send(err)
            return res.status(200).send(res1)
        })
    })  
})
/* .....................................Delete user............................................*/
// Cara day3
// app.delete('/products/:id',(req,res)=>{
//     arrprod.splice(req.params.id-1,1)
//     res.send(arrprod)
// })
app.delete('/users/:id',(req,res) => {
    var sqldel1 = `delete from pengguna where id=${req.params.id}`
    db.query(sqldel1, (err,result) => {
        if(err) return res.send(err)
        db.query('select * from pengguna', (err,result1) => {
            if(err) return res.status(500).send(err)
            return res.status(200).send(result1)
        })
    })
})

app.listen(PORT,()=>console.log('Berhasil jalan di port '+ PORT))       // Posisi selalu yang paling terakhir