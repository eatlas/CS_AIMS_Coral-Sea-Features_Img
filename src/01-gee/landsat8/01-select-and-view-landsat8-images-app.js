// Copyright 2021 Marc Hammerton - Australian Institute of Marine Science
//
// MIT License https://mit-license.org/
// This script is written to run on the Google Earth Engine.
//
// This script allows the user to browse through the image catalog to
// manually select the clearest images available. These can then be
// collated into a collection for subsequent processing.
//
// Code based on the examples https://github.com/google/earthengine-api/blob/master/javascript/src/examples/UserInterface/MosaicEditor.js
// and https://github.com/google/earthengine-api/blob/master/javascript/src/examples/UserInterface/LandsatExplorer.js .

// === README: Change the path to your local copy of the utils code ====
// The path to the util code must be an absolute path including the username and repository:

// 'users/__USERNAME__/__REPOSITORY__:l8Utils.js').utils;
var landsat8Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/landsat8/l8Utils.js').utils;


// The namespace for our application.  All the state is kept in here.
var app = {};

/** Creates the app constants. */
app.createConstants = function () {
  app.EXPORT_FOLDER = 'EarthEngine/Coral-Sea-Mapping'
  app.INITIAL_POINT = ee.Geometry.Point([155.493, -21.285]); // Coral Sea
  app.COLLECTION_IDS = {
    'L8 Collection 2 Tier 1 TOA': {
      id: 'LANDSAT/LC08/C02/T1_TOA',
      processor: landsat8Utils
    },
    'L9 Collection 2 Tier 1 TOA': {
    id: 'LANDSAT/LC09/C02/T1_TOA',
    processor: landsat8Utils
  }
  };
  app.START_DATE = '2013-01-01';
  app.END_DATE = new Date().toISOString().slice(0, 10);
  app.MAX_CLOUD_COVER = 5;
  app.COLOURS = {
    'cyan': '#24C1E0',
    'transparent': '#11ffee00',
    'gray': '#F8F9FA'
  };
  app.SECTION_STYLE = {margin: '20px 0 0 0'};
  app.TITLE_STYLE = {
    fontWeight: '100',
    fontSize: '32px',
    padding: '10px',
    color: '#616161',
    backgroundColor: app.COLOURS.transparent
  };
  app.PARAGRAPH_STYLE = {
    fontSize: '14px',
    fontWeight: '50',
    color: '#9E9E9E',
    padding: '8px',
    backgroundColor: app.COLOURS.transparent
  };
  app.LABEL_STYLE = {
    fontWeight: '50',
    textAlign: 'center',
    fontSize: '11px',
    backgroundColor: app.COLOURS.transparent
  };
  app.LABEL_LIST_STYLE = {
    fontSize: '12px',
    fontWeight: '50',
    padding: '0',
    backgroundColor: app.COLOURS.transparent
  };
  app.THUMBNAIL_WIDTH = 256;
  app.BORDER_STYLE = '4px solid rgba(97, 97, 97, 0.05)';
};

/** Initialises the app properties **/
app.createProperties = function() {
  app.point = app.INITIAL_POINT;
  app.mosaicImage = null;

  // set app processor to processor from first collection
  app.processor = app.COLLECTION_IDS[Object.keys(app.COLLECTION_IDS)[0]].processor;

  // set visOptions to options from first collection
  app.visOptions = app.processor.VIS_OPTIONS;
};

/** Creates the UI panels. */
app.createPanels = function () {
  /* The introduction section. */
  app.intro = {
    panel: ui.Panel([
      ui.Label({
        value: 'Satellite Composite App',
        style: app.TITLE_STYLE
      }),
      ui.Label('This app allows you to filter and export images ' +
        'from the Landsat 8 collection.' +
        'To change which tiles are included in the mosaic, check or uncheck ' +
        'the thumbnails. To mosaic another area, pan/zoom and click on the map.', app.PARAGRAPH_STYLE)
    ])
  };

  /* The collection filter controls. */
  app.filters = {
    collectionId: ui.Select({
      items: Object.keys(app.COLLECTION_IDS),
      value: Object.keys(app.COLLECTION_IDS)[0],
      onChange: function (selectedItem) {
        // update processor and visOptions according to collection
        app.processor = app.COLLECTION_IDS[selectedItem].processor;
        app.visOptions = app.processor.VIS_OPTIONS;

        // update visualisation select field
        app.vis.select.setValue(Object.keys(app.visOptions)[0]);

        // Refresh the map layer.
        app.updateMosaic();
      }
    }),
    maxCloudCover: ui.Textbox(app.MAX_CLOUD_COVER, app.MAX_CLOUD_COVER),
    startDate: ui.Textbox('YYYY-MM-DD', app.START_DATE),
    endDate: ui.Textbox('YYYY-MM-DD', app.END_DATE),
    applyButton: ui.Button('Apply filters', app.applyFilters),
    loadingLabel: ui.Label({
      value: 'Loading...',
      style: {stretch: 'vertical', color: app.COLOURS.gray, shown: false}
    })
  };

  /* The panel for the filter control widgets. */
  app.filters.panel = ui.Panel({
    widgets: [
      ui.Label('1) Select filters', {fontWeight: 'bold'}),
      ui.Label('Collection', app.LABEL_STYLE), app.filters.collectionId,
      ui.Label('Maximum cloud cover', app.LABEL_STYLE), app.filters.maxCloudCover,
      ui.Label('Start date', app.LABEL_STYLE), app.filters.startDate,
      ui.Label('End date', app.LABEL_STYLE), app.filters.endDate,
      ui.Panel([
        app.filters.applyButton,
        app.filters.loadingLabel
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });

  app.thumbnails = {
    loadingLabel: ui.Label({
      value: 'Loading...',
      style: {stretch: 'vertical', color: app.COLOURS.gray, shown: false}
    }),
    thumbnailGrid: ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal', true),
      style: {
        stretch: 'vertical',
        backgroundColor: app.COLOURS.transparent
      }
    })
  };

  /* The panel for the thumbnails */
  app.thumbnails.panel = ui.Panel({
    widgets: [
      ui.Label('2) Select images', {fontWeight: 'bold'}),
      app.thumbnails.thumbnailGrid
    ],
    style: app.SECTION_STYLE
  });

  /* The visualization section. */
  app.vis = {
    label: ui.Label(),
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      items: Object.keys(app.visOptions),
      value: Object.keys(app.visOptions)[0],
      onChange: function (selectedItem) {
        // Update the label's value with the select description.
        var option = app.visOptions[selectedItem];
        app.vis.label.setValue(option.description);

        // apply filter to update thumbnails
        app.applyFilters();

        // Refresh the map layer.
        app.updateMosaic();
      }
    }),
    checkboxSunGlintCorrection: ui.Checkbox('Sun-Glint-Correction', true, function () {
      app.updateMosaic();
    }),
    checkboxCloudMask: ui.Checkbox('Cloud-Mask', true, function () {
      app.updateMosaic();
    })
  };

  /* The panel for the visualization section with corresponding widgets. */
  app.vis.panel = ui.Panel({
    widgets: [
      ui.Label('3) Select a visualization', {fontWeight: 'bold'}),
      app.vis.select,
      app.vis.label,
      app.vis.checkboxSunGlintCorrection,
      app.vis.checkboxCloudMask
    ],
    style: app.SECTION_STYLE
  });

  /* The export section. */
  app.export = {
    button: ui.Button({
      label: 'Export the current image to Drive',
      // React to the button's click event.
      onClick: app.exportMosaic
    })
  };

  /* The panel for the export section with corresponding widgets. */
  app.export.panel = ui.Panel({
    widgets: [
      ui.Label('4) Start an export', {fontWeight: 'bold'}),
      app.export.button
    ],
    style: app.SECTION_STYLE
  });

  app.mosaicInfo = {
    infoLabelPanel: ui.Panel({
      layout: ui.Panel.Layout.flow('vertical'),
      style: {
        width: '100%'
      },
      widgets: [
        ui.Label('No images selected.', app.LABEL_LIST_STYLE)
      ]
    })
  }
  // The panel to hold the mosaic image IDs.
  app.mosaicInfo.panel = ui.Panel({
    layout: ui.Panel.Layout.flow('vertical'),
    style: {
      border: app.BORDER_STYLE,
      padding: '4px',
      margin: '5px',
      width: '350px',
      position: 'bottom-right'
    },
    widgets: [
      ui.Label('Mosaic Image IDs', {fontWeight: 'bold'}),
      app.mosaicInfo.infoLabelPanel
    ]
  });
}

/** Creates the app helper functions. */
app.createHelpers = function () {
  /**
   * Enables or disables loading mode.
   * @param {boolean} enabled Whether loading mode is enabled.
   */
  app.setLoadingMode = function (enabled) {
    // Set the loading label visibility to the enabled mode.
    app.filters.loadingLabel.style().set('shown', enabled);
    // Set each of the widgets to the given enabled mode.
    var loadDependentWidgets = [
      app.vis.select,
      app.filters.maxCloudCover,
      app.filters.startDate,
      app.filters.endDate,
      app.filters.applyButton,
      app.export.button
    ].concat(app.thumbnails.thumbnailGrid.widgets().map(function (item) {
      if (item.widgets) {
        return item.widgets().get(2)
      }
    }));
    loadDependentWidgets.forEach(function (widget) {
      if (widget) {
        widget.setDisabled(enabled);
      }
    });
  };

  /**
   * Return the visualisation parameters
   * @return {{min: number[], max: number[], bands: string[], gamma: number[]}|*}
   */
  app.getVisParameters = function () {
      return app.visOptions[app.vis.select.getValue()].visParams;
  }

  /** Applies the selection filters currently selected in the UI. */
  app.applyFilters = function () {
    app.setLoadingMode(true);
    var collectionId = app.COLLECTION_IDS[app.filters.collectionId.getValue()].id;

    var images = ee.ImageCollection(collectionId).filterBounds(app.point);

    // Set filter variables.
    var start = app.filters.startDate.getValue();
    if (start) start = ee.Date(start);
    var end = app.filters.endDate.getValue();
    if (end) end = ee.Date(end);
    if (start) images = images.filterDate(start, end);

    var first = ee.Image(images.first());
    images = images.filterBounds(first.geometry().centroid());

    images = app.processor.filterCloudCover(images, app.MAX_CLOUD_COVER);

    app.thumbnails.thumbnailGrid.clear();
    images
      .aggregate_array('system:id')
      .evaluate(function (ids) {
        // Sometimes there are no images where the user has clicked.
        if (ids === undefined) {
          app.thumbnails.thumbnailGrid.add(ui.Label('No images found!', {fontWeight: 'bold'}));
          app.setLoadingMode(false);
          return;
        }

        ids.forEach(function (id) {
          var thumb = app.makeThumbnail(id);
          app.thumbnails.thumbnailGrid.add(thumb);
        });

        // Recompute the mosaic from the new image IDs and add to the mapPanel.
        app.updateMosaic();

        // Center the map to the new mosaic
        app.map.centerObject(first);
        app.setLoadingMode(false);
      });
  };

  /** Create a thumbnail image to be added to the grid **/
  app.makeThumbnail = function (id) {
    var thumbnailContainer = ui.Panel({
      layout: ui.Panel.Layout.flow('vertical'),
      style: {
        backgroundColor: app.COLOURS.transparent,
        border: app.BORDER_STYLE,
        padding: '4px',
        margin: '5px'
      }
    });

    // Add an image label to the thumbnail container.
    var idPieces = id.split('/');
    var shortImageId = idPieces[idPieces.length - 1];
    var imageLabel = ui.Label(shortImageId, app.LABEL_STYLE);
    thumbnailContainer.add(imageLabel);

    var image = ee.Image(id);

    // Add the thumbnail itself to the container
    var thumbnail = ui.Thumbnail({
      image: image.visualize(app.getVisParameters()),
      params: {dimensions: app.THUMBNAIL_WIDTH, crs: 'EPSG:3857', format: 'jpg'},
      style: {
        width: app.THUMBNAIL_WIDTH + 'px',
        maxHeight: app.THUMBNAIL_WIDTH + 25 + 'px',
        backgroundColor: app.COLOURS.transparent
      }
    });
    thumbnailContainer.add(thumbnail);

    // Add the checkbox to specify which thumbnails to include in the mosaic.
    var includeFunction = function () {
      app.updateMosaic();
    };
    var includeCheckbox = ui.Checkbox('Include', false, includeFunction, false, app.LABEL_STYLE);
    thumbnailContainer.add(includeCheckbox);

    // Add the checkbox to show/hide image on map.
    var showFunction = function (checked) {
      var mapLayerName = shortImageId + " - " + app.vis.select.getValue();
      if (checked) {
        if (app.vis.checkboxSunGlintCorrection.getValue()) {
          image = app.processor.removeSunGlint(image);
        }
        if (app.vis.checkboxCloudMask.getValue()) {
          image = app.processor.maskClouds(image);
        }
        app.map.addLayer(app.processor.visualiseImage(image, app.vis.select.getValue()), {}, mapLayerName);
      } else {
        // remove existing mosaic
        app.map.layers().forEach(function (layer) {
          if (layer.getName() === mapLayerName) {
            app.map.remove(layer);
          }
        });
      }
    };
    var showCheckbox = ui.Checkbox('Show on map', false, showFunction, false, app.LABEL_STYLE);
    thumbnailContainer.add(showCheckbox);

    return thumbnailContainer;
  }

  /** Update the mosaic with the selection from the thumbnail grid **/
  app.updateMosaic = function () {
    // remove existing mosaic
    app.map.layers().forEach(function (layer) {
      if (layer.getName() === 'Mosaic') {
        app.map.remove(layer);
      }
    });

    var thumbs = app.thumbnails.thumbnailGrid.widgets();
    var ids = [];
    thumbs.forEach(function f(item) {
      if (item.widgets) {
        var id = item.widgets().get(0).getValue();
        var checked = item.widgets().get(2).getValue();
        if (checked) {
          ids.push(app.COLLECTION_IDS[app.filters.collectionId.getValue()].id + '/' + id);
        }
      }
    });

    // clear mosaic info panel (remove all previous IDs from panel)
    app.mosaicInfo.infoLabelPanel.clear();
    if (ids.length === 0) {
      // add info label to mosaic info panel
      app.mosaicInfo.infoLabelPanel.add(ui.Label('No images selected.', app.LABEL_LIST_STYLE))
      return;
    }
    else {
      // show image IDs in mosaic info panel
      ids.map(function (imageId) {
        app.mosaicInfo.infoLabelPanel.add(ui.Label(imageId, app.LABEL_LIST_STYLE))
      });
    }

    app.mosaicImage = app.processor.createMosaicImage(
      ids,
      app.vis.checkboxSunGlintCorrection.getValue(),
      app.vis.checkboxCloudMask.getValue()
    );
    app.mosaicImage = app.processor.visualiseImage(app.mosaicImage, app.vis.select.getValue());
    app.map.addLayer(app.mosaicImage, {}, 'Mosaic');
  };

  /**
   * Export mosaic and save to Google drive
   */
  app.exportMosaic = function () {
    if (app.mosaicImage) {
      var collectionId = app.COLLECTION_IDS[app.filters.collectionId.getValue()].id;

      var imageIdTrailer = "";
      app.thumbnails.thumbnailGrid.widgets().forEach(function f(e) {
        var id = e.widgets().get(0).getValue();
        var checked = e.widgets().get(2).getValue();
        if (checked) {
          imageIdTrailer = id.substring(0, id.lastIndexOf('_'));
        }
      });

      var fileName = 'SatelliteComposite-Export-' + collectionId.replace(/\//g, "_") + "-" + imageIdTrailer;
      // Export the image to Drive.
      Export.image.toDrive({
        image: app.mosaicImage,
        description: fileName,
        folder: app.EXPORT_FOLDER,
        fileNamePrefix: fileName,
        region: app.mosaicImage.geometry(),
        scale: 30,          // Native image resolution of Landsat 8 is 30m.
        maxPixels: 3e8     // Raise the default limit of 3e8 to fit the export
      });
    } else {
      print("No mosaic selected.")
    }
  };
};

/** Creates the application interface. */
app.boot = function () {
  ui.root.clear();

  app.createConstants();
  app.createProperties();
  app.createHelpers();
  app.createPanels();
  var sidePanel = ui.Panel({
    widgets: [
      app.intro.panel,
      app.filters.panel,
      app.thumbnails.panel,
      app.vis.panel,
      app.export.panel
    ],
    layout: ui.Panel.Layout.flow('vertical', true),
    style: {
      stretch: 'horizontal',
      height: '100%',
      width: '650px',
      backgroundColor: app.COLOURS.gray,
      border: app.BORDER_STYLE
    }
  });
  /* The map section. */
  app.map = ui.Map({ style: {cursor: 'crosshair'} })
    .add(ui.Label('Click the map to compute a mosaic at that location'))
    .add(app.mosaicInfo.panel);

  // Add a click event to the map panel.
  app.map.onClick(function (coords) {
    app.map.layers().reset();
    app.point = ee.Geometry.Point(coords.lon, coords.lat);
    app.point.evaluate(function () {
      app.applyFilters();
    });
    app.map.addLayer(app.point, {color: app.COLOURS.cyan}, 'Pointer');
  });
  app.map.addLayer(app.point, {color: app.COLOURS.cyan}, 'Pointer');
  app.map.centerObject(app.point);

  // Use a SplitPanel so it's possible to resize the two panels.
  ui.root.add(ui.SplitPanel(sidePanel, app.map));

  app.applyFilters();
};

app.boot();
