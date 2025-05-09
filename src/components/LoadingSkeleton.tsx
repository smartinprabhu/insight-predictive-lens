import React from "react";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";

const FullPageSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoadingSkeleton = () => (
  <FullPageSkeleton>
    <Skeleton variant="rectangular" width="100%" height={150} style={{ marginBottom: 10 }} />
    <CircularProgress style={{ color: "#2275e0" }} />
  </FullPageSkeleton>
);

export default LoadingSkeleton;
