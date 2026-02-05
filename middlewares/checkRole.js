const checkRole = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.admin.role)) {
        return res.json({
          success: false,
          message: "Access Denied"
        })      
    }
    console.log("authAdmin");
  }
}

export default checkRole