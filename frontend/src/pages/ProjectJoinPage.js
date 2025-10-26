// frontend/src/pages/ProjectJoinPage.js - UPDATED FOR CHALLENGE FLOW
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProjectChallengeInterface from '../components/ProjectChallengeInterface';

const ProjectJoinPage = () => {
  const { projectId, inviteCode } = useParams(); // Handle both projectId and inviteCode
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the actual project ID
  const actualProjectId = projectId || inviteCode;

  const handleClose = () => {
    // Navigate back to dashboard or projects page
    if (location.state?.from) {
      // Go back to where user came from
      navigate(location.state.from);
    } else {
      // Default back to dashboard
      navigate('/');
    }
  };

  const handleSuccess = (result) => {
    console.log('🎉 Challenge completed successfully:', result);
    
    if (result.projectJoined) {
      // User successfully joined the project via challenge
      // Navigate to the project dashboard
      setTimeout(() => {
        navigate(`/project/${actualProjectId}/dashboard`);
      }, 2000); // Give time for user to see success message
    } else if (result.passed) {
      // Challenge passed but didn't auto-join (shouldn't happen normally)
      // Still redirect to project dashboard or back to projects
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    }
  };

  const handleFailure = () => {
    // Challenge failed - user can retry or go back
    console.log('❌ Challenge failed, user can retry');
    // Don't automatically navigate away, let user decide
  };

  return (
    <div>
      <ProjectChallengeInterface 
        projectId={actualProjectId} 
        onClose={handleClose}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
};

export default ProjectJoinPage;