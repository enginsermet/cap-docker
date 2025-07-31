sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("bookstore.controller.Home", {
    onInit() {
      this._entityName = "/Books";
    },
    onCreate: function () {
      var oModel = this.getView().getModel();
      oModel.resetChanges();
      var oContext;
      var oContext = oModel.createEntry(this._entityName);
      oModel.setDefaultBindingMode("TwoWay");

      this._openDialog(oContext);
    },
    _openDialog: function (oContext) {
      var oDialog = this.byId("editDialog");
      var oForm = this.byId("smartForm");
      oForm.setBindingContext(oContext);
      oDialog.open();
    },
    onEdit: function () {
      var oTable = this.byId("smartTable").getTable();
      var oSelectedIndices = oTable.getSelectedIndices();

      if (oSelectedIndices.length > 0) {
        var oSelectedIndex = oSelectedIndices[0]; // Use the first selected index
        var oContext = oTable.getContextByIndex(oSelectedIndex); // Get the context by index
        var oModel = this.getView().getModel();
        oModel.setDefaultBindingMode("TwoWay");
        this._openDialog(oContext); // Open the dialog with the selected context
      } else {
        MessageToast.show("Please select a record to edit.");
      }
    },

    onSave: function () {
      var oForm = this.byId("smartForm");
      var bIsValid = this._validateForm(oForm);
      var oModel = this.getView().getModel();
      console.log(oModel);
      if (bIsValid) {
        var changes = oModel.getPendingChanges();
        console.log("Changes", changes);

        Object.keys(changes).forEach((tableKey) => {
          var tableData = changes[tableKey];
          oModel.submitChanges({
            success: function (oEvent) {
              if (
                oEvent?.__batchResponses &&
                oEvent?.__batchResponses[0]?.__changeResponses &&
                oEvent?.__batchResponses[0]?.__changeResponses[0]
                  ?.statusCode === "201"
              ) {
                MessageToast.show("Changes saved successfully!");
              } else if (
                oEvent?.__batchResponses &&
                oEvent?.__batchResponses[0]?.response?.body &&
                JSON.parse(oEvent?.__batchResponses[0]?.response?.body)?.error
                  ?.message?.value
              ) {
                MessageToast.show(
                  JSON.parse(oEvent?.__batchResponses[0]?.response?.body)?.error
                    ?.message?.value
                );
              } else {
                MessageToast.show("An error occured while saving.");
              }

              var oSmartTable = this.byId("smartTable");
              oSmartTable.setEditable();
              this.byId("smartFilterBar").fireSearch();
            }.bind(this),
            error: function () {
              MessageToast.show("Error while saving changes.");
              this.byId("smartFilterBar").fireSearch();
            },
          });
        });
        this.byId("editDialog").close();
      }
    },

    onCancel: function () {
      var oModel = this.getView().getModel();
      oModel.resetChanges();
      var oForm = this.byId("smartForm");
      var aGroups = oForm.getGroups();
      aGroups.forEach(function (oGroup) {
        oGroup.getGroupElements().forEach(function (oGroupElement) {
          oGroupElement.getFields().forEach(function (oField) {
            if (oField instanceof sap.ui.comp.smartfield.SmartField) {
              oField.setValueState(sap.ui.core.ValueState.None);
            }
          });
        });
      });
      this.byId("editDialog").close();
    },
    onDelete: function () {
      var oTable = this.byId("smartTable").getTable();
      var oSelectedIndices = oTable.getSelectedIndices(); // Get selected indices

      if (oSelectedIndices.length > 0) {
        var oModel = oTable.getModel();
        var aPaths = []; // To store the selected record paths

        // Enable deferred groups for batch processing
        oModel.setDeferredGroups(
          oModel.getDeferredGroups().concat(["deleteGroup"])
        );
        // const defGroup = oModel.getDeferredGroups();

        // Loop through selected indices to build delete operations
        oSelectedIndices.forEach(function (iIndex) {
          var oContext = oTable.getContextByIndex(iIndex); // Get context for each selected record
          var sPath = oContext.getPath(); // Get the path of the selected record
          aPaths.push(sPath);

          // Add remove operation to the deferred group
          oModel.remove(sPath, {
            groupId: "deleteGroup",
            changeSetId: "deleteChangeSet" + iIndex, // Same change set ID to group the operations
            success: function () {
              console.log("delete success", iIndex);
              // Success handler for each individual deletion
            },
            error: function () {
              console.log("delete failed", iIndex);
              MessageToast.show("Error while deleting record.");
            },
          });
        });

        // Submit batch delete request
        oModel.submitChanges({
          groupId: "deleteGroup",
          success: function (oData) {
            console.log("odata", oData);
            if (oData.__batchResponses && oData.__batchResponses[0].response) {
              // Check if there is an error in the batch response
              var response = oData.__batchResponses[0].response;
              // Handle the error case
              if (response.statusCode >= 400) {
                MessageToast.show(
                  "Error while saving changes: " +
                    JSON.parse(response?.body)?.error?.message?.value
                );
                oModel.resetChanges();
                oTable.setEditable();
                this.byId("smartFilterBar").fireSearch();
                return; // Exit success handler as this is actually an error
              } else {
                MessageToast.show("Changes saved successfully!");
                oTable.setEditable();
              }
            }
          }.bind(this),
          error: function () {
            console.log("deleteS failed");
            this.byId("smartFilterBar").fireSearch();
            MessageToast.show("Error while deleting selected records.");
          },
        });
      } else {
        MessageToast.show("Please select at least one record to delete.");
      }
    },
    _validateForm: function (oForm) {
      var bIsValid = true;

      // Get all group elements in the SmartForm
      var aGroups = oForm.getGroups();
      aGroups.forEach(function (oGroup) {
        oGroup.getGroupElements().forEach(function (oGroupElement) {
          oGroupElement.getFields().forEach(function (oField) {
            // Validate SmartFields
            if (oField instanceof sap.ui.comp.smartfield.SmartField) {
              var sValue = oField.getValue();
              if (oField.getMandatory() && !sValue) {
                bIsValid = false;
                oField.setValueState(sap.ui.core.ValueState.Error);
                oField.setValueStateText("This field is required.");
              } else {
                oField.setValueState(sap.ui.core.ValueState.None);
              }
            }
          });
        });
      });
      return bIsValid;
    },
  });
});
