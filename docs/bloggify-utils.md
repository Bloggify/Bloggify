# Bloggify Utils

The [`bloggify-utils`](https://github.com/Bloggify/bloggify-utils) module is a utility module that provides some useful functions and objects for Bloggify applications. It provides util `actions`, authentication handlers, CSS assets, common error codes, geolocation utilities, common models, React components and common `services`.

## Installation

```sh
npm i -S bloggify-utils
```

## Usage

```js
// In the app/actions/db.js
module.exports = require("bloggify-utils/lib/actions/db");
```

## Configuration

The following configuration is mandatory:

 - `imports.dir`: The directory where the imported files will be saved (such as csv files).
 - `uploads.dir`: The directory where the uploaded files will be saved.

## Errors

 - MISSING_DATA (`<1>`)
 - NOT_AUTHORIZED
 - NOT_FOUND
 - VALIDATION_FAILED (`<1>`)

## Models

### ActivityLogItem

 - `action`: `STRING`
 - `model`: `STRING`
 - `item_id`: `INTEGER`
 - `metadata`: `JSON`
 - `actor_email`: `STRING`

### File

 - `originalname`: `STRING
 - `encoding`: `STRING
 - `mimetype`: `STRING
 - `filename`: `STRING
 - `extension`: `STRING
 - `size`: `INTEGER`

### Settings

 - `settings`: `JSON`





## Services

### `ActivityLog`

#### `ActivityLog.log(data)`

Logs an activity.

```js
Bloggify.services.ActivityLog.log.call(ctx, {
    action: "create",
    model: "User",
    item_id: 42,
    metadata: {
        name: "John"
    }
})
```

#### `ActivityLog.getLogs()`

Gets a list of activity logs.

```js
const logs = await Bloggify.services.ActivityLog.getLogs({
    where: {
        action: "create"
    }
});
```

### `Auth`

#### `Auth.beforeActionsRequestRole(role)`

Verifies if the user has the required role to access the action.

```js
exports.before = Bloggify.services.Auth.beforeActionsRequestRole("admin")
```

### `Database`

#### `Database.importCsv(data)`

Imports a CSV file.

##### Params

  - `data` (Object): An object containing:
    - `model` (String): The model name.
    - `path` (String): The path to the CSV file.

##### Example

```js
Bloggify.services.Database.importCsv({
    model: "User",
    path: "/path/to/file.csv"
})
```

#### `Database.exportCsv(data)`

Export the records of a model to a CSV file.

##### Params

 - `data` (Object): An object containing:
    - `model` (String): The model name.
    - `path` (String): The path to the CSV file.

##### Example

```js
const exportedFilePath = await Bloggify.services.Database.exportCsv({
    model: "User"
})
```

#### `Database.query(data)`

Query the database.

##### Params

 - `data` (Object): An object containing:
    - `page` (Number): The page number.
    - `perPage` (Number): The number of items per page.
    - `search` (String): The search query.
    - `model` (String): The model name.
    - `sorting` (Array): An array of objects containing:
    - `where` (Object): The where condition.
    - `include` (Array): The included models.

##### Returns 

An object containing:

 - `count` (Number): The total number of records.
 - `rows` (Array): The records.
 - `pageCount` (Number): The total number of pages.
 - `model` (String): The model name.

##### Example

```js
const data = await Bloggify.services.Database.query({
    model: "User",
    page: 1,
    perPage: 10,
    search: "John",
    where: { age: { $gt: 42 } },
    sorting: [
        { field: "name", direction: "ASC" }
    ],
});
```

#### `Database.beforeCreateOrUpdate(data)`

A hook that is called before creating or updating a record.

##### Example

```js
Bloggify.services.Database.beforeCreateOrUpdate = async ({ instance, operationType, model, ctx }) => {
  // ...
});
```

#### `Database.delete(data)`

Delete a record from the database.

##### Params

 - `data` (Object): An object containing:
     - `model` (String): The model name.
     - `id` (Number): The record ID.

##### Example

```js
const deletedRecord = await Bloggify.services.Database.delete({
    model: "User",
    id: 42
});
```

#### `Database.getExistingColumnValues(data)`

Get the existing column values.

##### Params

 - `data` (Object): An object containing:
     - `model` (String): The model name.
     - `column` (String): The column name.

##### Returns

An object containing:

 - `values` (Array): The existing column values.
 - `model` (String): The model name.
 - `column` (String): The column name.

##### Example

```js
const existingColumnValues = await Bloggify.services.Database.getExistingColumnValues({
    model: "User",
    column: "name"
});
```

#### `Database.getSchema(data)`

Get the schema of a model.

##### Params

 - `data` (Object): An object containing:
     - `model` (String): The model name.

##### Returns

An object containing:  

  - `model` (String): The model name.
  - `fields` (Array): The model fields. Each field is an object containing:
      - `name` (String): The field name.
      - `type` (String): The field type.
      - `field_metadata` (Object): The field metadata.
      - `privileges` (Object): The field privileges.
          - `read` (Boolean): If the field can be read.
          - `write` (Boolean): If the field can be written.

##### Example

```js
const schema = await Bloggify.services.Database.getSchema({
    model: "User"
});
```

#### `Database.bulkDelete(data)`

Delete multiple records.

##### Params

 - `data` (Object): An object containing:
     - `model` (String): The model name.
     - `ids` (Array): The record IDs to delete.

##### Example

```js
const deletedItems = await Bloggify.services.Database.bulkDelete({
    model: "User", 
    ids: [ 42, 43, 44 ]
});
```

### `Settings`

#### Events

The following events are emitted:

 - `settings_init`: Emitted when the settings are initialized.
 - `settings_updated`: Emitted when the settings are updated.

#### `Settings.set(data)`

Set the settings.

##### Params

  - `data` (Object): The settings data.

##### Example

```js  
Bloggify.services.Settings.set({
    siteName: "My Site"
});
```

#### `Settings.get()`

Get the settings.

##### Returns

The settings object.

##### Example

```js
const settings = await Bloggify.services.Settings.get();
```

#### `Settings.saveSettingsToDisk()`

Save the settings to disk.

##### Example

```js
await Bloggify.services.Settings.saveSettingsToDisk();
```

#### `Settings.loadSettingsFromDisk()`

Load the settings from disk.

##### Example

```js
await Bloggify.services.Settings.loadSettingsFromDisk();
```

### `Util`

#### `Util.handleFriendlyError(fn)`

Handle friendly errors.

##### Params

  - `fn` (Function): The function to be executed.

##### Returns

A promise that resolves to the result of the function.

##### Example

```js
const result = await Bloggify.services.Util.handleFriendlyError(() => {
    // ...
});
```

## Actions

Below are the available actions. These actions are used in the `app/actions` directory.

### `db` – Database Actions

#### `db.query`

Queries a model. The body should contain the following fields:

- `model` (string): The model name.
- `page` (number): The page number.
- `perPage` (number): The number of items per page.
- `search` (string): The search term.
- `sorting` (object): The sort object.
- `where` (object): The where object.
- `include` (array): The included models.

```js
const Actions = require("bloggify/actions")

Actions.post("db.query", {
    model: "User",
    page: 1,
    perPage: 10,
    search: "John",
    where: { age: { $gt: 42 } },
})
```

#### `db.save`

Saves a record. The body should contain the following fields:

- `model` (string): The model name.
- `data` (object): The data to save. If the `id` is present, the record will be updated. Otherwise, it will be created.

```js
const Actions = require("bloggify/actions")

Actions.post("db.save", {
    model: "User",
    data: {
        name: "John",
        age: 42
    }
})
```

#### `db.getExistingColumnValues`

Gets the existing column values uniquely. The body should contain the following fields:

- `model` (string): The model name.
- `column` (string): The column name.

```js
const Actions = require("bloggify/actions")

Actions.post("db.getExistingColumnValues", {
    model: "User",
    column: "name"
})
```

#### `db.delete`

Deletes a record. The body should contain the following fields:

- `model` (string): The model name.
- `id` (number): The record ID.

```js
const Actions = require("bloggify/actions")

Actions.post("db.delete", {
    model: "User",
    id: 42
})
```

#### `db.bulkDelete`

Deletes multiple records. The body should contain the following fields:

- `model` (string): The model name.
- `ids` (array): The record IDs.

```js
const Actions = require("bloggify/actions")

Actions.post("db.bulkDelete", {
    model: "User",
    ids: [ 42, 43, 44 ]
})
```

#### `db.getSchema`

Gets the schema for a model. The body should contain the following fields:

- `model` (string): The model name.

```js
const Actions = require("bloggify/actions")

Actions.post("db.getSchema", {
    model: "User"
})
```

#### `db.exportCsv`

Exports a model to a CSV file. The body should contain the following fields:

- `model` (string): The model name.

The form should post the data to the `Actions.url("db.exportCsv")` route and the CSV file will be downloaded.

#### `db.importCsv`

Imports a CSV file. The body should contain the following fields:

- `model` (string): The model name.
- `file` (file): The CSV file.

### `files` – File Actions

#### `files.fileUpload`

Uploads a file. The body should contain the following fields:

- `file` (file): The file to upload.

#### `files.fileList`

Lists files. 

```js
Actions.get("files.fileList").then(files => {
    // ...
})
```

#### `files.fileDelete`

Deletes a file. The body should contain the following fields:

- `id` (string): The file ID.

#### `files.fileFetch`

Fetches a file. The body should contain the following fields:

- `id` (string): The file ID, or
- `path` (string): The file path.

### `settings` – Settings Actions

#### `settings.get`

Gets the settings.

#### `settings.set`

Sets the settings. The body should contain the following fields:

- `settings` (object): The settings object.

## Authentication Handlers

### `hasRole (expectedRole, existingRoles)`

Checks if the user has the expected role.

```js
const { hasRole } = require("bloggify-utils/lib/auth")

if (hasRole("admin", user.roles)) {
    // user is admin
}
```

## CSS Assets

### `application-container.css`

The CSS for the application container (useful for dashboards).

```css
@import "bloggify-utils/lib/assets/css/application-container.css";
```

### Geolocation Utilities

#### `countries.js`

The list of countries.

```js
const {
    // All countries
    COUNTRIES,
    // EU countries
    EU_COUNTRIES,
    // Check if a country is a certain country
    countryIs
} = require("bloggify-utils/lib/geo/countries")

if (countryIs("US", "USA")) {
    // check aliases
}

if (countryIs("Romania", "RO")) {
    // check aliases
}
```

## React Components

### `createRoot(App)`

Creates a root component.

#### Params

 - `App` (React Component): The root component to render.

#### Example

```jsx
const createRoot = require("bloggify-utils/lib/react/create-root");

const App = () => {
    return <div>Hello World</div>;
};

createRoot(App);
```

### CreatableSelect

Creates a select component that allows creating new options.

#### Params

 - `value` (String): The current value.
 - `onChange` (Function): The change handler.
 - `schemaField` (Object): The schema field.
 - `record` (Object): The current record.
 - `disabled` (Boolean): If the component is disabled.
 - `model` (String): The model name.

#### Example

```jsx
<CreatableSelect
    value={value}
    onChange={onChange}
    schemaField={schemaField}
    record={record}
    disabled={disabled}
    model="User"
/>
```

### DashboardCard

A dashboard card component.

#### Params

 - `title` (String): The card title.
 - `image` (String): The card image.
 - `link` (String): The card link.
 - other props to be passed to the card.

 #### Example

 ```jsx
<DashboardCard
    title="My Card"
    image="/path/to/image.jpg"
    link="/path/to/page"
/>
```

### EntityToChoose

A component to choose an entity.

#### Params

 - `model` (String): The model name.
 - `onChange` (Function): The change handler.
 - `idField` (String): The ID field.
 - `value` (String): The current value.
 - `filterQuery` (Function): The filter query.
 - `disabled` (Boolean): If the component is disabled.
 - `formatLabel` (Function): The label formatter.


#### Example

```jsx
<EntityToChoose
    model="User"
    onChange={onChange}
    idField="id"
    value={value}
    filterQuery={filterQuery}
    disabled={disabled}
    formatLabel={formatLabel}
/>
```

### FileInput

A file input component.

#### Params

 - `label` (String): The label.
 - `uploadAction` (String): The upload action.
 - `fileUploaded` (Function): The file uploaded handler.
 - `mediaPath` (String): The media path.

#### Example

```jsx
<FileInput
    label="Upload a file"
    uploadAction={Actions.url("files.fileUpload")}
    fileUploaded={data => console.log(data)}
    mediaPath="/media"
/>
```

### IframeWebView

An iframe web view component.

#### Params

 - `content` (String): The content.

#### Example

```jsx
<IframeWebView content="<h1>Hello World</h1>" />
```

### ModelTable

A table component for a model.

#### Params

 - `model` (String): The model name.
 - `tableColumns` (Array): The table columns to display.
 - `listSlug` (String): The list slug.
 - `defaultSorting` (Array): The default sorting.
 - `bulkDelete` (Boolean): If bulk delete is enabled.
 - `onRowSelectionChange` (Function): The row selection change handler.
 - `where` (Object): The where condition.
 - `include` (Array): The included models.
 - `isLinkedTable` (Boolean): If the table is linked.

#### Example

```jsx
<ModelTable
    model="User"
    tableColumns={[
        "name",
        "age",
    ]}
    listSlug="users"
    defaultSorting={[{ field: "name", direction: "ASC" }]}
    bulkDelete
    onRowSelectionChange={selectedRows => console.log(selectedRows)}
    where={{ age: { $gt: 42 } }}
    include={[ "Role" ]}
    isLinkedTable
/>
```

### Page Alerts

A component to display page alerts.

#### Example

```jsx
const { PageAlert, AccessDeniedAlert, NotImplementedAlert } = require("bloggify-utils/lib/react/page-alerts");

<PageAlert
    title="Title"
    description="Description"
/>

<AccessDeniedAlert />

<NotImplementedAlert />
```

### Spinner

A spinner component.

#### Example

```jsx
const { Spinner } = require("bloggify-utils/lib/react/spinner");

<Spinner />
```

### UserToChoose

A component to choose a user.

#### Params

All that the `EntityToChoose` component accepts.

#### Example

```jsx
<UserToChoose
    onChange={onChange}
    disabled={disabled}
    formatLabel={formatLabel}
/>
```

### UniversalCrudRecord

A universal CRUD record component.

#### Params

 - `model` (String): The model name.
 - `listSlug` (String): The list slug.
 - `renderer` (Function): The renderer function. Default: `defaultRenderer`.
 - `allowedFields` (Array): The allowed fields.
 - `EditRecordForm` (React Component): The edit record form component. Default: `EditRecordForm`.
 - `viewTitle` (String): The view title.
 - `customButtonGroup` (React Component): The custom button group.
 - `availableControls` (Array): The available controls. Default: `["create", "edit", "delete", "export_csv", "import_csv"]`.
 - `isLinkedTable` (Boolean): If the table is linked.

#### Example

```jsx
<UniversalCrudRecord
    model="User"
    listSlug="users"
    renderer={record => <div>{record.name}</div>}
    allowedFields={[ "name", "age" ]}
    EditRecordForm={EditRecordForm}
    viewTitle="Users"
    customButtonGroup={CustomButtonGroup}
    availableControls={[ "create", "edit", "delete", "export_csv", "import_csv" ]}
/>
```

### UniversalModelTable

A universal model table component.

#### Params

 - `model` (String): The model name.
 - `listTitle` (String): The list title.
 - `listSlug` (String): The list slug.
 - `afterHeader` (React Component): The after header component.
 - `availableControls` (Array): The available controls. Default: `["create", "edit", "delete", "export_csv", "import_csv"]`.
 - `isLinkedTable` (Boolean): If the table is linked.

#### Example

```jsx
<UniversalModelPage
    model="Section"
    listTitle="Sections"
    listSlug="sections"
    viewTitle={c => <span>Section {c ? <strong>{c.full_name}</strong> : null}</span>}
    tableColumns={[
        { header: "Name", accessorKey: "full_name", cell: s => <SectionBadge section={s.row.original} /> },
        { header: "Status", accessorKey: "status" },
        { header: "Year", accessorKey: "year" },
    ]}
    linkedTables={[
        {
            content: (c) => <SectionCourseworkEditor section={c} />,
        },
        {
            model: "Coursework",
            listTitle: "Coursework",
            listSlug: "coursework",
            viewTitle: (c) => <span></span>,
            tableColumns: [
                {
                    header: "Name", accessorKey: "coursework.name", cell: s => {
                        return <LinkContainer to={`/dashboard/section-coursework/${s.row.original.id}`}>
                            <a>{s.row.original.coursework.name}</a>
                        </LinkContainer>
                    }
                },
                { header: "Description", accessorKey: "coursework.description" },
                { header: "Value", accessorKey: "value" },
                {
                    header: "Actions",
                    accessorKey: "section_coursework",
                    cell: s => {
                        return <ButtonToolbar>
                            <ButtonGroup className="me-2">
                                <LinkContainer
                                    to={{
                                        pathname: "/dashboard/instructor-tools/grade-coursework",
                                        search: `?sectionCourseworkId=${s.row.original.id}&sectionId=${s.row.original.section_id}`
                                    }}
                                >
                                    <Button bsStyle="primary" size="sm">
                                        <i className="fa fa-pencil" /> Grade
                                    </Button>
                                </LinkContainer>
                            </ButtonGroup>
                            <SectionCourseworkGradeProgress sectionCoursework={s.row.original} />
                        </ButtonToolbar>
                    }
                },
            ],
            include: [{
                model: "Coursework",
                as: "coursework",
            }],
            through: "SectionCoursework",
            filter: s => ({ section_id: s.id }),
            availableControls: []
        },
        {
            model: "Student",
            listTitle: "Students",
            listSlug: "students",
            viewTitle: (c) => <span></span>,
            tableColumns: [
                { header: "Number", accessorKey: "student.number", cell: s => <UserBadge user={s.row.original.student} /> },
                { header: "Name", accessorKey: "student.full_name", cell: s => <LinkContainer to={`/dashboard/student-attended-sections/${s.row.original.id}`}><a>{s.row.original.student.full_name}</a></LinkContainer> },
                { header: "Email", accessorKey: "student.email" },
                { header: "Current Grade", accessorKey: "grade", cell: s => s.row.original.grade ? `${s.row.original.grade} / 100` : "N/A" }
            ],
            include: [{
                model: "User",
                as: "student",
            }],
            through: "StudentAttendedSection",
            filter: s => ({ section_id: s.id }),
            availableControls: [{
                content: () => {
                    if (!hasRole(["ADMIN", "SUPERADMIN"], BloggifyPage.user.roles)) {
                        return null
                    }
                    const sectionId = location.pathname.split("/").pop()
                    return <a href={`/dashboard/student-attended-sections/new?data.section_id=${sectionId}`} target="_blank">
                        <Button variant="primary" className="ml-2">
                            <i className="fas fa-plus-circle"></i> Add Student
                        </Button>
                    </a>
                }
            }]
        }
    ]}
    {...otherProps}
/>
```