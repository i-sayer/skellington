# skellington
template for web apps
preview link https://i-sayer.github.io/skellington/index.html

```javascript
options = {
    root: null,
    rootMargin: "0px",
    threshhold: 1
}
anielement = document.querySelector(".animateWhenVisible");
try {
    observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(anielement);
    function handleIntersect(entries, observer) {
        entries.forEach(function(entry) {
            var ptr = (entry.isIntersecting)?"add":"remove";
            entry.target.classList[ptr]("goAnim");
        });
    }
} catch (dontcare) {
    anielement.classList.add("goAnim");
}
```
