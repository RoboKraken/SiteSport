const express= require("express");
const path= require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;

client=new Client({
    database:"proiect",
    user:"postgres",
    password:"postgres",
    host:"localhost",
    port:5432
})

client.connect()
/*client.query("select * from prajituri", function(err, rezultat ){
    console.log(err)
    console.log("Rezultat query:", rezultat)
})
client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezultat ){
    console.log(err)
    console.log(rezultat)
})*/

app= express();


console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");

obGlobal={
    obErori:null
}


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut)
    obGlobal.obErori=JSON.parse(continut)
    console.log(obGlobal.obErori)

    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}

initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){
        return elem.identificator==identificator
    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    })

}



app.use("/resurse", express.static(path.join(__dirname,"resurse")))
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
});

app.get(["/","/index","/home"], function(req, res){
    let galerie = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")));
    let cale_galerie = galerie.cale_galerie;
    let imagini = galerie.imagini;
    let now = new Date();
    let hour = now.getHours();
    let timp;
    
    if (hour >= 5 && hour < 12) {
        timp = "dimineata";
    } else if (hour >= 12 && hour < 20) {
        timp = "zi";
    } else {
        timp = "noapte"; 
    }
    
    console.log(`Current hour: ${hour}, Selected time: ${timp}`);
    
    let imagini_filtrate = imagini.filter(img => img.timp === timp);
    console.log(`Total images: ${imagini.length}, Filtered images: ${imagini_filtrate.length}`);
    
    let n = imagini_filtrate.length - (imagini_filtrate.length % 3);
    if (n > 0) imagini_filtrate = imagini_filtrate.slice(0, n);
    
    res.render("pagini/index", {
        ip: req.ip,
        imagini: imagini_filtrate,
        cale_galerie: cale_galerie
    });
})

app.get("/galerie", function(req, res){
    try {
        let galerie = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")));
        let cale_galerie = galerie.cale_galerie;
        let imagini = galerie.imagini;
        let now = new Date();
        let hour = now.getHours();
        let timp;
        
        
        if (hour >= 5 && hour < 12) {
            timp = "dimineata";
        } else if (hour >= 12 && hour < 20) {
            timp = "zi";
        } else {
            timp = "noapte"; 
        }
        
        console.log(`Gallery - Current hour: ${hour}, Selected time: ${timp}`);
        
        let imagini_filtrate = imagini.filter(img => img.timp === timp);
        console.log(`Gallery - Total images: ${imagini.length}, Filtered images: ${imagini_filtrate.length}`);
        
        
        //let n = imagini_filtrate.length - (imagini_filtrate.length % 3);
        //if (n > 0) imagini_filtrate = imagini_filtrate.slice(0, n);
        
        res.render("pagini/galerie", {
            imagini: imagini_filtrate,
            cale_galerie: cale_galerie
        });
    } catch (error) {
        console.error("Error loading gallery:", error);
        afisareEroare(res, 500);
    }
})

/*app.get("/despre", function(req, res){
    res.render("pagini/despre");
})*/

app.get("/index/a", function(req, res){
    res.render("pagini/index");
})


app.get("/cerere", function(req, res){
    res.send("<p style='color:blue'>Buna ziua</p>")
})


app.get("/fisier", function(req, res, next){
    res.sendfile(path.join(__dirname,"package.json"));
})


app.get("/abc", function(req, res, next){
    res.write("Data curenta: ")
    next()
})

app.get("/abc", function(req, res, next){
    res.write((new Date())+"")
    res.end()
    next()
})


app.get("/abc", function(req, res, next){
    console.log("------------")
})

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res,403);
})


app.get(/.*\.ejs$/, function(req, res, next){
    afisareEroare(res,400);
})


app.get(/.*/, function(req, res, next){
    try{
        res.render("pagini"+req.url,function (err, rezultatRandare){
            if (err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                console.log(rezultatRandare);
                res.send(rezultatRandare)
            }
        });
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
        }
        else{
            afisareEroare(res);
        }
    }
})



app.listen(8080);
console.log("Serverul a pornit")


