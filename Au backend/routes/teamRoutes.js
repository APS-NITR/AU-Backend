const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamController');
const validateRequest = require('../middleware/validateRequest');
const { createTeamSchema } = require('../validators/teamSchema');

// POST /api/teams/register
router.post('/register', validateRequest(createTeamSchema), teamController.createTeam);

// GET /api/teams/:teamId
router.get('/:teamId', teamController.getTeamById);

// GET /api/teams
router.get('/', teamController.getAllTeams);

// PUT /api/teams/:teamId
router.put('/:teamId', validateRequest(createTeamSchema), teamController.updateTeam);

// DELETE /api/teams/:teamId
router.delete('/:teamId', teamController.deleteTeam);

// POST /api/teams/join
router.post('/join', teamController.joinTeam); 

// POST /api/teams/leave
router.post('/leave', teamController.leaveTeam);

// POST /api/teams/invite
router.post('/invite', teamController.inviteMember);

// POST /api/teams/accept-invite
router.post('/accept-invite', teamController.acceptInvite);

// POST /api/teams/reject-invite
router.post('/reject-invite', teamController.rejectInvite);

// POST /api/teams/assign-leader
router.post('/assign-leader', teamController.assignLeader);

// POST /api/teams/remove-member
router.post('/remove-member', teamController.removeMember);

// POST /api/teams/transfer-ownership
router.post('/transfer-ownership', teamController.transferOwnership);   

// POST /api/teams/rename
router.post('/rename', teamController.renameTeam);




module.exports = router;
