Simultra
=========

## Setup the development environment

### 1. checkout dependent project: vizicities

```
$ git clone https://github.com/itolab-hayashi-rafik/vizicities.git
```

### 2. checkout this project

```
$ git clone https://github.com/itolab-hayashi-rafik/Simultra.git
```

### 3. install the dependencies

```
$ cd Simultra/Simultra
$ npm install --dev
```

### 4. (for a better enviornment) use linklocal to link the projects

```
$ sudo npm install -g linklocal
$ linklocal // run this in the 'Simultra/Simultra' directory
```


## Build the project

To build the simultra project and produce a minified javascript file, run the following command:
```
$ gulp build
```

or, to start incremental builds:
```
$ gulp watch
```