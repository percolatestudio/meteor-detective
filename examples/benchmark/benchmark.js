DOCUMENT_COUNT = 1000;
DOCUMENT_SIZE = 100;

BenchmarkData = new Meteor.Collection('benchmarkData');

Router.map(function() {
  this.route('benchmark', {
    path: '/',
    waitOn: function() { 
      return Meteor.subscribe('allData'); 
    },
    action: function () {
      if (this.ready())
        this.render();
      else
        this.render('loading');
    }
  });
});

// Generates a random string of *length*
randomString = function(length) {
  var chars = [];
  var choice = "    abcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0;i < length;i++)
    chars.push(choice.charAt(Math.floor(Math.random() * choice.length)));

  return chars.join('');
}

if (Meteor.isServer) {
  if (BenchmarkData.find().count() === 0) {
    console.log('Generating approximately ' + (DOCUMENT_COUNT * DOCUMENT_SIZE)
      + ' bytes of data...');

    var payload = randomString(DOCUMENT_SIZE);

    for (var i = 0;i < DOCUMENT_COUNT;i++) {
      BenchmarkData.insert({payload: payload});
    }

    console.log('Finished.');
  }
  
  Meteor.publish('allData', function() {
    return BenchmarkData.find();
  });
}
