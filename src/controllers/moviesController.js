const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op, where } = require("sequelize");


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: [{association: "genre"}, {association: "actors"}]
        })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        db.Genre.findAll()
        .then(function(allGenres) {
            return res.render("moviesAdd", {allGenres:allGenres});
        })
        .catch(function(error) {
            console.error(error);
            res.status(500).send("Error Interno del Servidor");
        });
    },
    create: function (req,res) {
        const {title, rating, awards, release_date, length, genre_id} = req.body
        db.Movie.create({title, rating, awards, release_date, length, genre_id})
        .then(function() {
         res.redirect("/movies");
        })
        .catch(function(error) {
            console.error(error);
            res.status(500).send("Error Interno del Servidor");
        });

    },
    edit: function(req,res) {
        const movieId = req.params.id;
        Promise.all([
         db.Movie.findByPk (movieId, {
            include: [{ model: db.Genre, as: "genre"}]
         }),
        db.Genre.findAll()    
        ])
        .then(function([Movie, allGenres]) {
         res.render("moviesEdit", {Movie, allGenres});
        })
        .catch(function(error) {
            console.error(error);
            res.status(500).send("Error Interno del Servidor");
        }); 

    },
    update: function (req,res) {
        const id = req.params.id;
        const {title, rating, awards, release_date, length, genre_id} = req.body
        db.Movie.update({title, rating, awards, release_date, length, genre_id},{
            where: {id}
        })
        .then(function() {
         res.redirect("/movies");         
        })
        .catch(function(error) {
            console.error(error);
            res.status(500).send("Error Interno del Servidor");
        });

    },
    delete: function (req,res) {
        const movieId = req.params.id;
        db.Movie.findByPk(movieId)
        .then(movie => {
            res.render("moviesDelete", {movie});
        }) 
        .catch(error => {
            console.error(error);
            res.status(500).send("Error Interno del Servidor");
        });
},
    destroy: function (req,res) {
        const movieId = req.params.id;
        db.Movie.destroy({
            where: {id:movieId}
        })
        .then(function()  {
            res.redirect("/movies");         
           })
           .catch(function(error) {
               console.error(error);
               res.status(500).send("Error Interno del Servidor");
           });

    }
}

module.exports = moviesController;