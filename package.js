Package.describe({
  summary: "Measure performance of publications and subscriptions",
  version: "0.1.0",
  name: "percolate:detective",
  git: "https://github.com/percolatestudio/meteor-detective.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@0.9.2');

  api.add_files('detective.js', 'client');
  
  api.use(['mongo-livedata', 'iron:router']);
  
  api.export('Detective')
});
