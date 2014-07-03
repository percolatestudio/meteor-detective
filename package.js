Package.describe({
  summary: "Measure performance of publications and subscriptions"
});

Package.on_use(function (api, where) {
  api.add_files('performance.js', 'client');
  
  api.use(['mongo-livedata', 'iron-router']);
  
  api.export('Performance')
});
