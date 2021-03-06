var LocalCollectionDriver = Package['mongo-livedata'].LocalCollectionDriver;

Detective = {
  _totalDataSize: 0,

  collectionSize: function(collection) {
    var size = 0;
    collection.find().forEach(function(doc) {
      // XXX: unicode etc all -- length is not the right metric
      // ZOL: Use browser's native JSON for speed and dont worry about
      // binary data/extended attributes for now.
      size += JSON.stringify(doc).length;
    });
    return {size: size, count: collection.find().count()};
  },

  collectionSizeByName: function() {
    var result = {};
    _.each(Meteor.connection._mongo_livedata_collections, function(collection, name) {
      result[name] = Detective.collectionSize(collection);
    });
    return result;
  },

  // only works on client
  allCollectionsSize: function() {
    return _.reduce(Detective.collectionSizeByName(), function(size, total) {
      return size.size + total;
    });
  },

  logAllCollections: function() {
    var sizes = this.collectionSizeByName();
    var totalSize = 0, totalCount = 0;

    var str = '';
    _.each(sizes, function(size, name) {
      str += name + '-> size:' + size.size + ' count: ' + size.count + '\n';
      totalSize += size.size;
      totalCount += size.count;
    });

    str += '=======\nTOTAL-> size:' + totalSize + ' count:' + totalCount;

    console.log(str);
  },

  totalDataSize: function() {
    return this._totalDataSize;
  },

  startMeasuring: function() {
    var self = this;
    self._startTime = new Date;
    self._prevTime = new Date;
    self._dataSize = 0;

    if (! self._handling )
      Meteor.connection._stream.on('message', function(data) {
        self._dataSize += data.length;
        self._totalDataSize += data.length;
      });

    self._handling = true;
  },

  takeMeasurement: function(message) {
    var now = new Date;
    var cumulative = (now - this._startTime) / 1000;
    var delta = (now - this._prevTime) / 1000;
    console.log(message, '|', delta, 'sec |', cumulative, 'sec |', this._dataSize, 'bytes');
    this._prevTime = now;
  },

  takeInBetweenMeasurement: function() {
    console.log('Received', this._dataSize, 'bytes between routes');
  }
}

Detective.startMeasuring();

var STATE = {START: 0, WAITING: 1, READY: 2, RENDERED: 3};
var STATE_NAMES = {0: 'start', 1: 'waiting', 2: 'ready', 3: 'rendered'};

Router.onRun(function() {
  Detective.takeInBetweenMeasurement();
  console.log("message | delta | cumulative | data ");
  console.log("--------|-------|------------|------")
  Detective.startMeasuring();
  this._state = STATE.START;
  this.next();
});

Router.onBeforeAction(function() {
  var state = this.ready() ? STATE.READY : STATE.WAITING;
  if(state > this._state) {
    Detective.takeMeasurement(this.route.getName() + ": " + STATE_NAMES[state]);
    this._state = state;
  }
  this.next();
});

Router.onAfterAction(function() {
  var state = STATE.RENDERED;
  if(this.ready() && state > this._state) {
    Detective.takeMeasurement(this.route.getName() + ": " + STATE_NAMES[state]);
    this._state = state;
  }
});
