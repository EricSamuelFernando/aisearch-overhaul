
import React from "react"; 
import Opensign from "@opensign/react";

export default function App() {
  return (
    <div className="app">
      <Opensign
        onLoad={() => console.log("success")}
        onLoadError={(error) => console.log(error)}
        templateId= "#templateId"
        baseUrl="https://app.opensignlabs.com/api/app"
        appId="opensign"
      />
    </div>
  );
}

