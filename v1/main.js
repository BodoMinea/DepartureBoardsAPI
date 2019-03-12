$.get('https://cdn.jsdelivr.net/gh/BodoMinea/DepartureBoardsAPI@a1e249e/v1/body.html',function(data){
  $('body').html(data);
  var mymap = L.map('map').setView([44.43225,26.10626], 11.5);
                var layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    maxZoom: 17
                }).addTo(mymap);
                function createCircleMarker( feature, latlng ){
                  let options = {
                    radius: 4,
                    fillColor: "lightgreen",
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                  }
                  return L.circleMarker( latlng, options );
                }
                var cached;
                mymap.on('popupopen', function(e) {
                  $('#save').removeAttr('disabled');
                  var marker = e.popup._source;
                  cached = marker.feature.properties.stop_id;
                });
                (function(){
                    var originalInitTile = L.GridLayer.prototype._initTile
                    L.GridLayer.include({
                        _initTile: function (tile) {
                            originalInitTile.call(this, tile);

                            var tileSize = this.getTileSize();

                            tile.style.width = tileSize.x + 1 + 'px';
                            tile.style.height = tileSize.y + 1 + 'px';
                        }
                    });
                })();
                $('select').on('change',function(){
                    if($('select').val()!=0){
                        $('#save').removeAttr('disabled');
                        cached = $('select').val();
                    }
                })
                $('#save').on('click',function(){
                    $.get('/change?id='+cached,function(datax){
                        if(datax=="OK"){
                            toastr.success('Configurarea a fost actualizată!');
                        }else{
                            toastr.error('A apărut o eroare!');
                        }
                    })
                })
                $.get('https://cdn.jsdelivr.net/gh/BodoMinea/DepartureBoardsAPI@master/v1/stations.json',function(data){
                    geojsonFormattedLocations = data.map(function(location) {
                        return {
                            type: 'Feature',
                            geometry: {
                            type: 'Point',
                                coordinates: [location.lng, location.lat]
                            },
                            properties: {
                                "name":location.name,
                                "stop_id":location.id
                            }
                        };
                    });
                    L.geoJSON( geojsonFormattedLocations, {
                        pointToLayer: createCircleMarker,
                        onEachFeature: function (feature, layer) {
                            $('select').append('<option value="'+feature.properties.stop_id+'">'+feature.properties.name+'</option>');
                            layer.bindPopup('<center><h5>'+feature.properties.name+'</h5></center>');
                          }
                      }).addTo( mymap );
                    $('select').select2();
                })
});
