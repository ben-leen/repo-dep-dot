# repo-dep-dot
Creates dot file to visualize dependencies between repos

# Prerequisite (suggested)
- Download graphviz [here](http://www.graphviz.org/Download..php)

# Command usage
```
repodepdot

Options:

  -o, --org            Define github organization (required)
  -g, --github         Define a custom github instance URI
  -a, --auth           Define if you would like to be prompted for https credentials
  -f, --output-file    Define an output file
 ```

- Use one of the various graphviz commands to generate a visualization.  

E.g.: `dot -Tsvg np-dep.dot -o np-dep.dot.svg`

# Notes
You may run into rate limits if you execute on a very big organization, multiple times.  
Rate limits are higher if you authenticate.

![Alt text](circo_hapijs.svg "HapiJs")
