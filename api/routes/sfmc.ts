import Router from 'express'
import Controller from '../controllers/sfmc.controller'

const router = Router()

router.post('/save', Controller.save)
router.post('/validate', Controller.validate)
router.post('/execute', Controller.execute)
router.post('/publish', Controller.publish)
router.post('/stop', Controller.stop)


export default router