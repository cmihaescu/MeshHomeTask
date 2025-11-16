import React, { useState } from 'react';
import { createLink } from "@meshconnect/web-link-sdk";
import dotenv from "../../.env.local"

console.log("process.env.MESH_CLIENT_ID", local.env.MESH_CLIENT_ID)
const MeshWidget = () => {
//     const meshLink = createLink({
//       clientId: process.env.MESH_CLIENT_ID,
//       onIntegrationConnected: (payload) => {
//         // payload has auth_token, refresh_token, integrationId, userId, etc.
//         console.log("Connected!", payload);
//         // Save tokens to your backend via API
//       },
//       onExit: (error) => {
//         console.error("User closed or error:", error);
//       },
//       onTransferFinished: (payload) => {
//         console.log("Transfer result:", payload);
//         // Update UI or backend accordingly
//       }
//     });
    
//     // When user clicks “Connect wallet or exchange”:
//     meshLink.openLink(linkTokenFromBackend);

    return(
        <h1>Test 1</h1>
    )
}



export default MeshWidget