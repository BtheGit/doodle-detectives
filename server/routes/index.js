const router 									= require('express').Router(),
			APIRoutes 							= require('./indexAPI.js'),
			userRoutes							= require('./userRoutes.js'),
			baseRoutes							= require('./baseRoutes.js'),
			doodleRoutes 						= require('./doodleRoutes.js')

router.use('/api', APIRoutes);
router.use('/user', userRoutes);
router.use('/doodle', doodleRoutes);
router.use('/', baseRoutes);

module.exports = router;