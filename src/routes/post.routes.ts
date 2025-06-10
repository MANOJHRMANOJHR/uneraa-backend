import { Router, Request, Response } from 'express';
import postController from '../controllers/post.controllers'; 


const postRouter: Router = Router();
postRouter.route('/create').post(
  postController.createPost
);
postRouter.route('/update/:id').put(
  postController.updatePost
);
postRouter.route('/delete/:id').delete(
  postController.deletePost
);
postRouter.route('/').get(
  postController.getPosts
);

export default postRouter;