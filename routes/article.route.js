var express = require('express')
const Article = require("../models/article")
const SCategorie = require("../models/sCategorie")

var route = express.Router()

route.get('/pagination', async (req, res) => {
    const page = req.query.page || 1;// Current page
    const limit = req.query.limit || 5; // Number of items per page
    // Calculez le nombre d'éléments à sauter (offset)
    const offset = (page - 1) * limit;
    try {
        // Effectuez la requête à votre source de données en utilisant les paramètresde pagination

        const ArticlesTot = await Article.countDocuments();
        const Articles = await Article.find({}, null, { sort: { '_id': -1 } })
            .skip(offset)
            .limit(limit)
        res.status(200).json({ Articles: Articles, tot: ArticlesTot });
    } catch (error) {
        res.status(500).json({ message: `erreurrrrr ${error.message}` });
    }
});

route.get('/', async (req, res) => {
    try {
        const scat = await Article.find({}, null, { sort: { '_id': -1 } }).populate("scategorieID")
        res.status(200).json(scat)
    } catch (error) {
        res.status(404).json({ message: `erreur de find ${error}` })
    }
})
route.post('/', async (req, res) => {
    const newSCat = new Article(req.body)
    try {
        await newSCat.save()
        res.status(200).json({ message: `Ajouter avec succés` })
    } catch (error) {
        res.status(404).json({ message: `erreur de find ${error}` })
    }
})
route.put('/:id', async (req, res) => {
    try {
        await Article.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        res.status(200).json({ message: `Modifier avec succés` })
    } catch (error) {
        res.status(404).json({ message: `erreur de find ${error}` })
    }
})
route.delete('/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: `Supprimer avec succés` })
    } catch (error) {
        res.status(404).json({ message: `erreur de find ${error}` })
    }
})
route.get('/:id', async (req, res) => {
    try {
        res.status(200).json(await Article.findById(req.params.id).populate("categorieID"))
    } catch (error) {
        res.status(404).json({ message: `erreur de find ${error}` })
    }
})
// chercher un Article par s/cat
route.get('/scat/:scategorieID', async (req, res) => {
    try {
        const art = await Article.find({
            scategorieID:
                req.params.scategorieID
        }).exec();
        res.status(200).json(art);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
// chercher un Article par cat
route.get('/cat/:categorieID', async (req, res) => {
    try {
        // Recherche des sous-catégories correspondant à la catégorie donnée
        const sousCategories = await SCategorie.find({
            categorieID:
                req.params.categorieID
        }).exec();

        // Initialiser un tableau pour stocker les identifiants des sous-catégories trouvées

        const sousCategorieIDs = sousCategories.map(scategorie => scategorie._id);
        // Recherche des Articles correspondant aux sous-catégories trouvées
        const Articles = await Article.find({
            scategorieID: {
                $in:
                    sousCategorieIDs
            }
        }).exec();
        res.status(200).json(Articles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = route