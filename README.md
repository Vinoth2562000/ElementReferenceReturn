# Returning an ElementReference from JavaScript to .NET

This repository compares how Blazor handles a DOM element returned from JavaScript to .NET as an `ElementReference`.

It contains the same sample in .NET 10 and .NET 11, using three Blazor hosting models. The side-by-side projects make it easier to reproduce and compare the behavior described in [dotnet/aspnetcore#69159](https://github.com/dotnet/aspnetcore/issues/69159).

## What is being tested?

In this sample, JavaScript finds an input dynamically and returns the DOM element to .NET. .NET receives it as an `ElementReference` and passes the same reference back to another JavaScript function.

The complete flow is:

1. Blazor renders three form fields and captures them using `@ref`.
2. JavaScript finds the first empty field.
3. JavaScript returns that DOM element to .NET.
4. .NET receives the element as an `ElementReference`.
5. .NET passes the reference back to JavaScript.
6. JavaScript focuses and highlights the selected field.

The captured-element operation fails in the .NET 10 samples and succeeds in the tested .NET 11 RC build.

## Repository layout

The projects are separated by target framework:

```text
.
|-- Evidence/
|-- NET10/
|   |-- InteractiveServer/
|   |-- InteractiveWebAssembly/
|   `-- StandaloneWebAssembly/
|-- NET11/
|   |-- InteractiveServer/
|   |-- InteractiveWebAssembly/
|   `-- StandaloneWebAssembly/
`-- README.md
```

There are six runnable samples:

| Folder | Target framework | Hosting model | Test page |
| --- | --- | --- | --- |
| `NET10/InteractiveServer` | `net10.0` | Interactive Server | `/` |
| `NET10/InteractiveWebAssembly` | `net10.0` | Interactive WebAssembly | `/elementrefvalidation` |
| `NET10/StandaloneWebAssembly` | `net10.0` | Standalone WebAssembly | `/` |
| `NET11/InteractiveServer` | `net11.0` | Interactive Server | `/` |
| `NET11/InteractiveWebAssembly` | `net11.0` | Interactive WebAssembly | `/elementrefvalidation` |
| `NET11/StandaloneWebAssembly` | `net11.0` | Standalone WebAssembly | `/` |

## Requirements

- .NET 10 SDK and runtime for the .NET 10 samples
- .NET SDK `11.0.100-rc.1` for the .NET 11 samples
- A modern web browser

The .NET 10 WebAssembly projects reference ASP.NET Core `10.0.12` packages. The .NET 11 WebAssembly projects reference `11.0.0-rc.1.26425.128` packages.

This repository does not contain a `global.json`, so the `dotnet` CLI uses the newest compatible SDK installed on the machine.

Check the available SDKs and runtimes with:

```powershell
dotnet --list-sdks
dotnet --list-runtimes
```

## Clean-clone setup

I used commit [`21842fa6ecee6a31fbc1dbb864b7a70050fd4ca6`](https://github.com/Vinoth2562000/ElementReferenceReturn/commit/21842fa6ecee6a31fbc1dbb864b7a70050fd4ca6) as the baseline for this validation.

Start from a clean clone:

```powershell
git clone https://github.com/Vinoth2562000/ElementReferenceReturn.git
Set-Location .\ElementReferenceReturn
git checkout 21842fa6ecee6a31fbc1dbb864b7a70050fd4ca6
```

Restore all three hosting models for both framework versions:

```powershell
dotnet restore .\NET10\InteractiveServer\InteractiveServer.slnx
dotnet restore .\NET10\InteractiveWebAssembly\InteractiveWebAssembly.slnx
dotnet restore .\NET10\StandaloneWebAssembly\StandaloneWebAssembly.slnx

dotnet restore .\NET11\InteractiveServer\InteractiveServer.slnx
dotnet restore .\NET11\InteractiveWebAssembly\InteractiveWebAssembly.slnx
dotnet restore .\NET11\StandaloneWebAssembly\StandaloneWebAssembly.slnx
```

After restore completes, use the build commands below. To run and verify a sample, follow the **Running the samples** and **Reproducing the test** sections.

## Build status

I built all six samples on September 16, 2026 using:

- .NET SDK `10.0.401`
- .NET SDK `11.0.100-rc.1.26425.128`

These are the commands I used. I included `--no-incremental` so the compiler runs again and reports any current warnings instead of reusing the previous build.

### .NET 10

```powershell
dotnet build .\NET10\InteractiveServer\InteractiveServer.slnx --no-incremental
dotnet build .\NET10\InteractiveWebAssembly\InteractiveWebAssembly.slnx --no-incremental
dotnet build .\NET10\StandaloneWebAssembly\StandaloneWebAssembly.slnx --no-incremental
```

### .NET 11

```powershell
dotnet build .\NET11\InteractiveServer\InteractiveServer.slnx --no-incremental
dotnet build .\NET11\InteractiveWebAssembly\InteractiveWebAssembly.slnx --no-incremental
dotnet build .\NET11\StandaloneWebAssembly\StandaloneWebAssembly.slnx --no-incremental
```

### Results

| Version | Sample | Warnings | Errors |
| --- | --- | ---: | ---: |
| .NET 10 | Interactive Server | 0 | 0 |
| .NET 10 | Interactive WebAssembly | 0 | 0 |
| .NET 10 | Standalone WebAssembly | 0 | 0 |
| .NET 11 RC | Interactive Server | 0 | 0 |
| .NET 11 RC | Interactive WebAssembly | 1 | 0 |
| .NET 11 RC | Standalone WebAssembly | 0 | 0 |

All six projects build successfully. Five are completely clean. The .NET 11 Interactive WebAssembly project has one `ASPDEPR011` warning because [`Program.cs`](NET11/InteractiveWebAssembly/InteractiveWebAssembly/Program.cs) still uses `UseWebAssemblyDebugging`. Its launch settings also contain `inspectUri`. These were part of the original project setup and do not affect this sample.

The `BL0016` warning is not present in any of the projects. The JavaScript interop calls are wrapped with `try/catch` blocks.

You may also see a `NETSDK1057` message because .NET 11 is currently a preview SDK. It is only an informational message and is not counted as a build warning.

If the SDK cannot be resolved on your machine, run `dotnet --list-sdks` and make sure the required versions are installed. There is no `global.json` in this repository, so the CLI selects the newest compatible SDK that it can find.

## Running the samples

Clone the repository and run the required project from the repository root.

The .NET 10 and .NET 11 versions use the same configured ports. Run only one version of a hosting model at a time, or pass a different URL when starting the second project.

### Interactive Server

#### .NET 10

```powershell
dotnet run --project .\NET10\InteractiveServer\InteractiveServer.csproj
```

#### .NET 11

```powershell
dotnet run --project .\NET11\InteractiveServer\InteractiveServer.csproj
```

Open `http://localhost:5236/`.

### Interactive WebAssembly

#### .NET 10

```powershell
dotnet run --project .\NET10\InteractiveWebAssembly\InteractiveWebAssembly\InteractiveWebAssembly.csproj
```

#### .NET 11

```powershell
dotnet run --project .\NET11\InteractiveWebAssembly\InteractiveWebAssembly\InteractiveWebAssembly.csproj
```

Open `http://localhost:5216/elementrefvalidation`.

### Standalone WebAssembly

#### .NET 10

```powershell
dotnet run --project .\NET10\StandaloneWebAssembly\StandaloneWebAssembly.csproj
```

#### .NET 11

```powershell
dotnet run --project .\NET11\StandaloneWebAssembly\StandaloneWebAssembly.csproj
```

Open `http://localhost:5188/`.

If a configured port is unavailable, use the URL printed by `dotnet run`.

## Reproducing the test

The test page has three fields: **Full name**, **Email**, and **Message**.

1. Choose one of the scenario presets.
2. Select **Find next field**.
3. Check the result in the Evidence panel.

The presets fill different numbers of fields so JavaScript selects the next empty one:

- **Select name** leaves all fields empty.
- **Select email** fills the name field.
- **Select message** fills the name and email fields.
- **No empty field** fills all three fields.

When all fields have values, JavaScript returns `null`, and the page reports **No match**.

### Expected version comparison

| Scenario | .NET 10 | .NET 11 RC |
| --- | --- | --- |
| Return an element captured with `@ref` | Fails during JavaScript interop | Returns an `ElementReference`; the field is focused and highlighted |
| Return `null` when no field is empty | Reports **No match** | Reports **No match** |
| Return an element without `@ref` | Expected `__internalId is required` failure | Expected `__internalId is required` failure |

### Uncaptured element boundary

The page also contains an input that is intentionally not captured with `@ref`.

Select **Return uncaptured element** to ask JavaScript to return this input. The expected result is:

```text
__internalId is required
```

This is a boundary test. Blazor can only create an `ElementReference` for an element that it has captured, so the application records this result as an **Expected failure**.

## Main interop code

JavaScript returns the matching DOM element directly:

```javascript
export function findNextEmptyCapturedField() {
    const fields = document.querySelectorAll(
        "#validation-contact-form [data-validation-candidate]");

    return Array.from(fields)
        .find(field => field.value.trim().length === 0) ?? null;
}
```

.NET requests the result as a nullable `ElementReference`:

```csharp
var selectedElement =
    await jsModule.InvokeAsync<ElementReference?>("findNextEmptyCapturedField");

if (selectedElement is not null)
{
    await jsModule.InvokeAsync<string>("highlightField", selectedElement.Value);
}
```

The main sample files are:

### .NET 10

- [`NET10/InteractiveServer/Components/Pages/Home.razor`](NET10/InteractiveServer/Components/Pages/Home.razor)
- [`NET10/InteractiveServer/Components/Pages/Home.razor.js`](NET10/InteractiveServer/Components/Pages/Home.razor.js)
- [`NET10/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor`](NET10/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor)
- [`NET10/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js`](NET10/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js)
- [`NET10/StandaloneWebAssembly/Pages/Home.razor`](NET10/StandaloneWebAssembly/Pages/Home.razor)
- [`NET10/StandaloneWebAssembly/Pages/Home.razor.js`](NET10/StandaloneWebAssembly/Pages/Home.razor.js)

### .NET 11

- [`NET11/InteractiveServer/Components/Pages/Home.razor`](NET11/InteractiveServer/Components/Pages/Home.razor)
- [`NET11/InteractiveServer/Components/Pages/Home.razor.js`](NET11/InteractiveServer/Components/Pages/Home.razor.js)
- [`NET11/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor`](NET11/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor)
- [`NET11/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js`](NET11/InteractiveWebAssembly/InteractiveWebAssembly.Client/Pages/ElementRefValidation.razor.js)
- [`NET11/StandaloneWebAssembly/Pages/Home.razor`](NET11/StandaloneWebAssembly/Pages/Home.razor)
- [`NET11/StandaloneWebAssembly/Pages/Home.razor.js`](NET11/StandaloneWebAssembly/Pages/Home.razor.js)

## Evidence

The [`Evidence`](Evidence) folder contains screen recordings of the .NET 10 and .NET 11 behavior for each hosting model:

- [`Interactive Server`](Evidence/Interactive%20Server)
- [`Interactive WebAssembly`](Evidence/Interactive%20WebAssembly)
- [`Standalone WebAssembly`](Evidence/Standalone%20WebAssembly)

It also contains a document with more information about the test and its results.
