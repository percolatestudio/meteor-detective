var LocalCollectionDriver = Package['mongo-livedata'].LocalCollectionDriver;

Performance = {
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
      result[name] = Performance.collectionSize(collection);
    });
    return result;
  },
  
  // only works on client
  allCollectionsSize: function() {
    return _.reduce(Performance.collectionSizeByName(), function(size, total) {
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
  
  startMeasuring: function() {
    var self = this;
    self._startTime = new Date;
    self._dataSize = 0;
    
    Meteor.connection._stream.on('message', function(data) {
      self._dataSize += data.length;
      self._totalDataSize += data.length;
    });
  },
  
  takeMeasurement: function() {
    console.log('Took', (new Date - this._startTime) / 1000, 'seconds');
    console.log('Received', this._dataSize, 'bytes of data');
  },
  
  takeInBetweenMeasurement: function() {
    console.log('Received', this._dataSize, 'bytes between routes');
  }
}

Performance.startMeasuring();

Router.onRun(function() {
  // console.log("In between Routes:")
  // console.log("__________________")
  // Performance.takeMeasurement();
  // console.log('');
  
  Performance.takeInBetweenMeasurement();
  
  Performance.startMeasuring();
});

Router.onBeforeAction(function() {
  if (this.ready() && ! this._loggedPerformance) {
    this._loggedPerformance = true;
    console.log("Route loading time:")
    console.log("__________________")
    console.log('[' + this.route.name + ']')
    Performance.takeMeasurement();
    console.log('');
  
    Performance.startMeasuring();
  }
});