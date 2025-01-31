const express = require("express");
const authMiddleware = require("../authMiddleware");
const { User } = require("../db");
const zod = require("zod");

const updateBody = zod.object({
    picturePath: zod.string().optional(),
    location: zod.string().optional(),
    occupation: zod.string().optional(),
    password: zod.string().optional(),
    username: zod.string().optional()


})


const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, async (req, res) => {
    const user = await User.findOne({_id:req.userId});
    res.status(200).json(user);

})
// adding friend to friends list
userRouter.get("/friend", authMiddleware, async(req, res) => {
    const friendId = req.body.friendId;
    const isValid = await User.findOne({_id: friendId});
    if (!isValid) {
        return res.status(404).json({message:"Invalid user"});
    }
    if (friendId === req.userId) {
        return res.status(404).json({message:"Invalid friend"});
    }

    const user = await User.findByIdAndUpdate({_id:req.userId}, {$addToSet : { friends: friendId}});
    //const isAlreadyFriend = user.friends.includes(isValid);
    const friend = await User.findByIdAndUpdate({_id:friendId}, {$addToSet : {friends : req.userId}});

    /*if (!isAlreadyFriend) {
        user.friends.push(isValid._id);
        isValid.friends.push(user._id);

    }
    console.log(isValid._id);
    */
    res.status(200).json({
        user: user.friends,
        friend: friend.friends
    });
    



})
//removing friend from friends list
userRouter.put("/friend", authMiddleware, async (req, res) => {
    const friendId = req.body.friendId;
    const isValid = await User.findOne({_id: friendId});
    if (!isValid) {
        return res.status(404).json({message:"Invalid user"});
    }

    const user = await User.findByIdAndUpdate({_id:req.userId}, {$pull : {friends: friendId}});
    const friend = await User.findByIdAndUpdate({_id:friendId}, {$pull : {friends: req.userId}});
    //const isAlreadyFriend = user.friends.includes(isValid);

    /*if (isAlreadyFriend) {
        user.friends.filter(user => user !== friendId);
        isValid.friends.filter(user => user !== user._id);
    }
    console.log(isValid._id);*/
    res.status(200).json({
        user: user.friends,
        friend: friend.friends
    });

})
//get all the friends
userRouter.get("/friends", authMiddleware, async (req, res) => {
    const userId = req.userId;
    
    const user = await User.findOne({_id: userId})
    if (!user) {
          return res.status(411).json({message:"Invalid User"});
    }
    res.status(200).json({friends: user.friends}); 

})

//update on user profile
userRouter.put("/updateUser", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({message: "Invalid Inputs"});
    }
    const user = await User.findOne({_id:req.userId});
    if (!user) {
        return res.status(411).json({message: "Invalid user"});
    }
    const update = await User.updateOne({_id:req.userId}, req.body);
    res.status(200).json(user);
})


module.exports = userRouter;