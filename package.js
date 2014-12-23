Package.describe({
  summary: "Measure performance of publications and subscriptions",
  version: "0.2.1",
  name: "percolate:detective",
  git: "https://github.com/percolatestudio/meteor-detective.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@0.9.2');

  api.add_files('detective.js', 'client');

  api.use(['mongo-livedata', 'iron:router@1.0.1']);

  api.export('Detective')
});
