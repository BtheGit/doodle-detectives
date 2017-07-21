const router 									= require('express').Router(),
			userRoutes							= require('./userRoutes.js'),
			baseRoutes							= require('./baseRoutes.js'),
			doodleRoutes 						= require('./doodleRoutes.js')

router.use('/user', userRoutes);
router.use('/doodle', doodleRoutes);
router.use('/', baseRoutes);

module.exports = router;