function initAceEditor(id, mode, readOnly = false) {
  var editor = ace.edit(id);
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/" + mode);
  editor.setFontSize(15);
  editor.focus();
  editor.setReadOnly(readOnly);
  return editor;
}

function updateLogViewer() {
  var editor = ace.edit("log-viewer");
  var logs = window.electron.readLogs();
  editor.setValue(logs, -1);
}

window.onload = function () {
  // Setup error panel
  var errorPanel = initAceEditor("error-panel", "text", true);

  // Setup log viewer
  initAceEditor("log-viewer", "text", true);
  updateLogViewer();

  // Setup configuration editor
  var configEditor = initAceEditor("editor", "json");
  var config = window.electron.readConfig();
  configEditor.setValue(config, -1);
  configEditor.commands.addCommand({
    name: 'save config',
    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
    exec: function (editor) {
      var updatedConfig = JSON.parse(editor.getValue());
      var configUpdateStatus = window.electron.writeConfig(updatedConfig);
      errorPanel.setValue(JSON.stringify(configUpdateStatus, null, 4), -1);
      if(configUpdateStatus == "Configuration Updated Successfully.") {
        window.electron.reconfigureSweeper();
      }
      editor.setReadOnly(false);
    },
  });

  // Update Log Viewer every 5 seconds
  setInterval(updateLogViewer, 5000);
}