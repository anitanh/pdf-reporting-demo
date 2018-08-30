var raster = new ol.layer.Tile({
        title: 'Bing',
        titleColor: '#fff',
        type: 'base',
        visible: true,
        baseLayer: true,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'ArXqjakey0OiT17iGsoDrsA-e4dZudPYUqNFku1W_K7aJgKOQ3nPCZGKMbFOILT-',
            imagerySet: 'Aerial',
            maxZoom: 19
        })
    });

var source = new ol.source.Vector({wrapX: false});

var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(0, 86, 53, 0.7)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 4
          })
        })
});

var map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: new ol.View({
      center: [20, 0],
      zoom: 3
    })
});

var typeSelect = document.getElementById('type');
var draw;
function addInteraction() {
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
      map.addInteraction(draw);
    }
}

    function downloadPDF() {
        $('#loading-wrapper').show();
        var pdf_content = document.getElementById('map-wrapper');

        convertHdMap();
        $('.printsave').css('margin', '2px -2px -2px 2px');
        $('#map-preview').css('margin', '2px -2px -2px 2px');
        pdf_content.style.transform = pdf_content.style.webkitTransform = 'scale(3)';
        pdf_content.style.transformOrigin = pdf_content.style.webkitTransformOrigin = '0 0';

        setTimeout(function () {
            html2canvas(pdf_content, {
                width: pdf_content.offsetWidth * 3,
                height: pdf_content.offsetHeight * 3,
                onrendered: function (canvas) {
                    var img = canvas.toDataURL("image/png");
                    var pdf = new jsPDF({
                        orientation: 'landscape',
                        format: 'a4'
                    });
                    var width = pdf.internal.pageSize.width;
                    var height = pdf.internal.pageSize.height;
                    pdf.addImage(img, 'PNG', 0, 0, width, height);
                    pdf.save('demo.pdf');
                    pdf_content.style.transform = pdf_content.style.webkitTransform = 'scale(1)';
                    pdf_content.style.transformOrigin = pdf_content.style.webkitTransformOrigin = '0 0';
                    $('.printsave').each(function () {
                        $(this).remove();
                    });
                    $('#loading-wrapper').hide();
                }
            });
        }, 2000)
    }

    function toggleDrawControl(that) {
        if($(that).hasClass('active')){
            map.removeInteraction(draw)
        }else {
            addInteraction()
        }
        $(that).toggleClass('active');
    }

    function convertHdMap() {
        var newMapComponent,
            originalSize = map.getSize();

        var opt_ChangeSize = {width: originalSize[0], height: originalSize[1]};

        var div = $(document.createElement("div"));
        div.attr('id', 'save-map');
        div.addClass('printsave');
        div.css('position', 'absolute');
        div.css('top', '0');
        div.css('left', '0');
        div.css('width', opt_ChangeSize.width + 'px');
        div.css('height', opt_ChangeSize.height + 'px');
        $('#map').append(div);

        newMapComponent = new ol.Map({
            target: 'save-map',
            layers: map.getLayers(),
            pixelRatio: 5,
            view: map.getView()
        });

        newMapComponent.renderSync();

        map.setSize([opt_ChangeSize.width, opt_ChangeSize.height]);
        map.renderSync();
    }

    function addHeader(that) {
        if(!$(that).hasClass('active')) {
            $('#map').append('<div id="header-wrapper" style="position: absolute; right: 0; z-index: 2600; top: 0; background-color: rgba(255, 255, 255, 0.9); padding: 15px; font-weight: bolder; cursor: pointer; white-space: nowrap">PDF Download Demo</div>')
            var headerDraggable = $('#header-wrapper').draggable({
                containment: '#map',
                drag: function (event, ui) {
                    $('#map-preview-shadow').css({
                        'top': ui.position.top + 4,
                        'left': ui.position.left + 4,
                        'right': 'auto'
                    })
                }
            });
        }else {
            $('#header-wrapper').remove();
        }
        $(that).toggleClass('active')
    }
