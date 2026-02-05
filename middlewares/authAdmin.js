import jwt from 'jsonwebtoken'

const authAdmin = (req, res, next) => {
 
  try {
    
    const aToken = req.headers.atoken

    if (!aToken) {
      return res.states(401).json({success:false, message:"No Token"})
    }

    const decoded = jwt.verify(aToken, process.env.JWT_SECRET)

    console.log("authAdmin");
    

    req.admin = decoded

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
    
  }

}

export default authAdmin