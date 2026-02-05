import express from 'express'
import loginAdmin, { dashBoradData, getApproved, getRejected } from '../controller/Admincontroller.js'
import authAdmin from '../middlewares/authAdmin.js'
import checkRole from '../middlewares/checkRole.js'
import ResourcesData from '../controller/ResourcesController.js'
import {AiTools} from '../controller/AiToolsController.js'
import upload from '../middlewares/multer.js'

const adminRouter = express.Router()

// adminRouter.get('/passHashed',addAdmin)
adminRouter.post('/loginAdmin',loginAdmin)
adminRouter.post('/add-resources',authAdmin, ResourcesData)
adminRouter.post('/add-AiTools',authAdmin,upload.single("image"), AiTools)
adminRouter.get('/Dashborad',authAdmin, dashBoradData)
adminRouter.put('/AiTool-Apporval',authAdmin, getApproved)
adminRouter.put('/AiTool-Rejection',authAdmin, getRejected)


export default adminRouter