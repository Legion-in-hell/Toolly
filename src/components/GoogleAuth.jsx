import React, { useState } from "react";
import axios from "axios";
import GoogleLogin from "react-google-login";

const GoogleAuth = () => {
  const [user, setUser] = useState(null);

  const onSuccess = async (res) => {
    try {
      const response = await axios.post("/auth/", {
        token: res?.tokenId,
        username,
      });

      setUser(response.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      {!user && (
        <GoogleLogin
          clientId={process.env.REACT_APP_CLIENT_ID}
          onSuccess={onSuccess}
        />
      )}

      {user && (
        <>
          <img src={user.avatar} className="rounded-full" alt="User Avatar" />
          <h1 className="text-xl font-semibold text-center my-5">
            {user.name}
          </h1>
        </>
      )}
    </div>
  );
};

export default GoogleAuth;
