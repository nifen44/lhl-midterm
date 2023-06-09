const express = require('express');
const router  = express.Router();

const resourceQueries = require('../db/queries/resources');
const commentQueries = require('../db/queries/resourceComments');
const ratingQueries = require('../db/queries/ratings');
const categoryQueries = require('../db/queries/category');
const likesQueries = require('../db/queries/resourceLikes');

// GET route handler for /
router.get('/', (req, res) => {
  const userId = req.session.user_id;
  const { category_id } = req.query;

  const resourceQuery = category_id ? resourceQueries.getResourceByCategoryId(category_id) : resourceQueries.getAllResource(userId);
  Promise.all([resourceQuery, categoryQueries.getCategories()])
    .then((data) => {
      res.render('index',{resources: data[0], categories: data[1], userId, category_id});
    })
    .catch((error) => {
      console.error("Error retrieving resources:", error);
      res.status(500).json({ error: "Failed to retrieve resources" });
    });
});

// GET route handler for /myresources
router.get('/myresources', (req, res) => {
  const userId = req.session.user_id;
  Promise.all([
    resourceQueries.getResourceByUserId(userId),
    resourceQueries.getResourceUserLiked(userId)
  ])
    .then(([resources, resourcesLiked]) => {
      res.render('myresources',{resources, resourcesLiked,'liked_rs_by':true});
    })
    .catch((error) => {
      console.error("Error retrieving myresources:", error);
      res.status(500).json({ error: "Failed to retrieve resources" });
    });
});

router.get('/resource/:id', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  // resourceQueries.getResourceById(id)
  //   .then((resources) => {
  //     return commentQueries.getComments(id)
  //       .then((comments) => {
  //         return commentQueries.getTotalComments(id)
  //           .then((totalComments) => {
  //             return ratingQueries.avgRating(id)
  //               .then((avgRating) => {
  //                 if (!avgRating) {
  //                   avgRating = {'resource_id': id, 'avg_rating': '0' };
  //                 }
  //                 res.render('resource', { resources, comments, totalComments, avgRating});
  //               });
  //           });
  //       });
  //   })
  Promise.all([
    resourceQueries.getResourceById(id),
    likesQueries.totalLikesByResourceId(id),
    likesQueries.checkLikes(id,userId),
    commentQueries.getComments(id),
    commentQueries.getTotalComments(id),
    ratingQueries.avgRating(id)
  ])
    .then(([resources, totalLikes, isLiked, comments, totalComments, avgRating]) => {
      if (!avgRating) {
        avgRating = {'resource_id': id, 'avg_rating': '0' };
      }
      if (!totalLikes) {
        totalLikes = {'resource_id': id, 't_likes': '0' };
      }
      if (!isLiked) {
        isLiked = {'resource_id': id, 'liked_rs_by': false };
      }
      if (!totalComments.total_comments) {
        totalComments = {'resource_id': id, 'total_comments': '0' };
      }
      console.log("detail page total_likes :", totalLikes);
      res.render('resource', { resources, totalLikes, isLiked, comments, totalComments, avgRating });
    })
    .catch((error) => {
      console.error("Error retrieving resource detail:", error);
      res.status(500).json({ error: "Failed to retrieve resource in detail page" });
    });
});

// router.get('/category/:category_id', (req, res)=>{
//   const { category_id } = req.params;
//   console.log("---------", category_id);
//   resourceQueries.getResourceByCategoryId().then(resources=>{
//     let templateVars = {
//       resources,
//     };
//     console.log("the templatevars to categorize:",templateVars);
//     // return res.send(data);
//     res.render('index',{resources, userId: 1});
//   });
// });

module.exports = router;
