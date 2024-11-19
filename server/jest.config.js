// /** @type {import('jest').Config} */
// const config = {
//     verbose: true,
//   };
  
// module.exports = config;

module.exports = {
    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
};