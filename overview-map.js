var map_preview;
function addOverviewMap(that) {
    if(!$(that).hasClass('active')) {
        $('#map').append('<div id="map-preview-wrapper" style="position: absolute; right: 0; z-index: 2499; top: 0;"><div id="map-preview" class="overview-map" style="z-index: 2500; width: 300px; height: 300px;"></div></div>');
        map_preview = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                vector
            ],
            target: 'map-preview',
            view: new ol.View({
                center: [2896056.127, -3326529.470],
                zoom: 4,
                minZoom: 3,
                maxZoom: 15
            })
        });

        var mapPreviewDraggable = $('#map-preview').draggable({
            containment: '#map',
            drag: function (event, ui) {
                $('#map-preview-shadow').css({
                    'top': ui.position.top + 4,
                    'left': ui.position.left + 4,
                    'right': 'auto'
                })
            }
        });
        var widget = mapPreviewDraggable.data('ui-draggable');

        $('#map-preview').resizable({
            aspectRatio: true,
            minHeight: 150,
            maxHeight: 600,
            handles: "n, e, s, w, ne, se, sw, nw",
            autoHide: true,
            resize: function (event, ui) {
                widget._mouseStart(event);
                widget._mouseUp(event);
                $('#map-preview-shadow').css({
                    'width': ui.size.width,
                    'height': ui.size.height,
                    'top': ui.position.top + 4,
                    'left': ui.position.left + 4,
                    'right': 'auto'
                })
            },
            stop: function (event, ui) {
                widget._mouseStop(event);
                map_preview.updateSize();
                $('#map-preview-shadow').css({
                    'top': $('#map-preview').position().top + 4,
                    'left': $('#map-preview').position().left + 4,
                    'right': 'auto'
                })
            }
        });
        disablePreviewMapControl();
        $('.btn-overview-ctrl').show();
    }else {
        removeMapPreview();
    }
}

function disablePreviewMapControl() {
        $('#map-preview-section').find('.enable-pan').show();
        $('#map-preview-section').find('.disable-pan').hide();

        // Disable map interactions.
        map_preview.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(false);
            }
        }, this);
        map_preview.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.MouseWheelZoom) {
                interaction.setActive(false);
            }
        }, this);
        map_preview.getInteractions().getArray().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(false);
            }
        }, this);

        // Enable drag and resize event.
        $('#map-preview').draggable({
            disabled: false
        });
        $('#map-preview').resizable({
            disabled: false
        });
    }

    function enablePreviewMapControl() {
        $('#map-preview-section').find('.disable-pan').show();
        $('#map-preview-section').find('.enable-pan').hide();

        // Enable map interactions.
        this.map_preview.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(true);
            }
        }, this);
        this.map_preview.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.MouseWheelZoom) {
                interaction.setActive(true);
            }
        }, this);
        this.map_preview.getInteractions().getArray().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(true);
            }
        }, this);

        // Disable drag and resize event.
        $('#map-preview').draggable({
            disabled: true
        });

        $('#map-preview').resizable({
            disabled: true
        });
    }

    function toggleControl(that) {
        if($(that).hasClass('locked')){
            enablePreviewMapControl();
        }else {
            disablePreviewMapControl();
        }
        $(that).toggleClass('locked');
    }

    function removeMapPreview() {
        $('#map-preview-wrapper').remove();
        $('.btn-overview-ctrl').hide();
        $('#overview-edit').removeClass('locked');
    }

    function addOverviewInteraction() {
      var value = typeSelect.value;
        if (value !== 'None') {
          var geometryFunction;
          if (value === 'Square') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
          } else if (value === 'Box') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createBox();
          } else if (value === 'Star') {
            value = 'Circle';
            geometryFunction = function(coordinates, geometry) {
              if (!geometry) {
                geometry = new ol.geom.Polygon(null);
              }
              var center = coordinates[0];
              var last = coordinates[1];
              var dx = center[0] - last[0];
              var dy = center[1] - last[1];
              var radius = Math.sqrt(dx * dx + dy * dy);
              var rotation = Math.atan2(dy, dx);
              var newCoordinates = [];
              var numPoints = 12;
              for (var i = 0; i < numPoints; ++i) {
                var angle = rotation + i * 2 * Math.PI / numPoints;
                var fraction = i % 2 === 0 ? 1 : 0.5;
                var offsetX = radius * fraction * Math.cos(angle);
                var offsetY = radius * fraction * Math.sin(angle);
                newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
              }
              newCoordinates.push(newCoordinates[0].slice());
              geometry.setCoordinates([newCoordinates]);
              return geometry;
            };
          }
          draw = new ol.interaction.Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction,
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(0, 86, 53, 0.7)'
              }),
              stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 5
              }),
            })
          });
          map_preview.addInteraction(draw);
        }

    }

    function removeOverviewInteraction() {
        map_preview.removeInteraction(draw);
    }

    function toggleDraw(that) {
        if(!$(that).hasClass('locked')){
            addOverviewInteraction()
        }else {
            removeOverviewInteraction()
        }
        $(that).toggleClass('locked')
    }

    typeSelect.onchange = function() {
    if($('#overview-edit').hasClass('locked')) {
        map_preview.removeInteraction(draw);
        addOverviewInteraction();
    }
    if($('#toggle-draw-map').hasClass('active')) {
        map.removeInteraction(draw);
        addInteraction();
    }
    };
