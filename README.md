# Returning an ElementReference from JavaScript to .NET

This repository contains a few small Blazor projects that I used to test whether a JavaScript function can return a DOM element to .NET as an `ElementReference`.

This is related to [dotnet/aspnetcore#69159](https://github.com/dotnet/aspnetcore/issues/69159).

## Why I created this repository

In my use case, JavaScript finds an element dynamically. I need to return that element to .NET and later pass it back to another JavaScript function.

The flow is:

1. Blazor captures the form inputs using `@ref`.
2. JavaScript finds the first empty input.
3. The JavaScript function returns the input element to .NET.
4. .NET receives it as an `ElementReference`.
5. .NET passes the same reference back to JavaScript.
6. JavaScript focuses and highlights the input.

This did not work in .NET 10, but it works in the tested .NET 11 build. I added the same test to three different Blazor hosting models to make sure the behavior is consistent.

## Projects

| Project | Hosting model | Page |
| --- | --- | --- |
| `InteractiveServer` | Interactive Server | `/` |
| `InteractiveWebAssembly` | Interactive WebAssembly | `/elementrefvalidation` |
| `StandaloneWebAssembly` | Standalone WebAssembly | `/` |

## Requirements

- .NET SDK 11.0.100-rc.1
- A modern web browser

The SDK version is configured in [`global.json`](global.json).

You can check the installed version with:

```powershell
dotnet --version
```

## Running the projects

Clone the repository and run any one of the following commands from its root folder.

### Interactive Server

```powershell
dotnet run --project .\InteractiveServer\InteractiveServer.csproj
```

Open `http://localhost:5236/`.

### Interactive WebAssembly

```powershell
dotnet run --project .\InteractiveWebAssembly\InteractiveWebAssembly\InteractiveWebAssembly.csproj
```

Open `http://localhost:5216/elementrefvalidation`.

### Standalone WebAssembly

```powershell
dotnet run --project .\StandaloneWebAssembly\StandaloneWebAssembly.csproj
```

Open `http://localhost:5188/`.

If the port is already in use, open the URL shown in the `dotnet run` output instead.

## Trying the test

The page has three captured fields: **Full name**, **Email**, and **Message**.

1. Choose one of the scenario presets.
2. Click **Find next field**.
3. The first empty field should be focused and highlighted.
4. The Evidence panel should show a **Passed** result.

The **No empty field** preset fills all three fields. In that case, JavaScript returns `null`, and the Evidence panel shows **No match**.

### Uncaptured element test

There is also an input that does not have an `@ref`.

Click **Return uncaptured element** to return this input from JavaScript. This test is expected to fail with:

```text
__internalId is required
```

Blazor can only create an `ElementReference` for an element that it has captured. The application reports this error as an **Expected failure**.

## Main interop code

JavaScript returns the DOM element directly:

```javascript
export function findNextEmptyCapturedField() {
    const fields = document.querySelectorAll(
        "#validation-contact-form [data-validation-candidate]");

    return Array.from(fields)
        .find(field => field.value.trim().length === 0) ?? null;
}
```

.NET receives the result as a nullable `ElementReference`:

```csharp
var selectedElement =
    await jsModule.InvokeAsync<ElementReference?>("findNextEmptyCapturedField");

if (selectedElement is not null)
{
    await jsModule.InvokeAsync<string>("highlightField", selectedElement.Value);
}
```

The sample code is available in:

- [`InteractiveServer/Components/Pages/Home.razor`](InteractiveServer/Components/Pages/Home.razor)
- [`InteractiveServer/Components/Pages/Home.razor.js`](InteractiveServer/Components/Pages/Home.razor.js)
- [`InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor`](InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor)
- [`InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js`](InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js)
- [`StandaloneWebAssembly/Pages/Home.razor`](StandaloneWebAssembly/Pages/Home.razor)
- [`StandaloneWebAssembly/Pages/Home.razor.js`](StandaloneWebAssembly/Pages/Home.razor.js)

## Evidence

The [`Evidence`](Evidence) folder contains screen recordings for .NET 10 and .NET 11. Recordings are included for all three hosting models:

- [`Interactive Server`](Evidence/Interactive%20Server)
- [`Interactive WebAssembly`](Evidence/Interactive%20WebAssembly)
- [`Standalone WebAssembly`](Evidence/Standalone%20WebAssembly)

It also contains a document with more details about the test and its results.
