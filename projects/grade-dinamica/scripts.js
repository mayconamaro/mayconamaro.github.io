var courses;
var creditSum = 0;
var totalCredits = 0;
const curriculumContainer = document.getElementById('curriculum');
const selector = document.getElementById('course-select');
var actualCourse = selector.value;

selector.addEventListener("change", () => {
    actualCourse = selector.value;
    loadJSON(response => {
        courses = JSON.parse(response);
    }, actualCourse);
    createGrid();
});

function loadJSON(callback, actualCourse) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './courses/'+ actualCourse + '.json', false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

const createCourseElement = ({
    id,
    title,
    credits,
    requires,
    quarter,
    isCompleted
}) => {

    totalCredits += credits;

    const course = document.createElement('div');
    const courseCode = document.createElement('p');
    const courseTitle = document.createElement('h2');
    const courseCredits = document.createElement('p');

    course.id = id;
    course.classList.add('course');
    course.classList.add(setCourseStatus(course.id));
    course.onclick = _ => courseEventHandler(course);

    courseCode.innerHTML = id;
    courseCode.className = 'course-code';

    courseTitle.innerHTML = title;
    courseTitle.className = 'course-title';
    
    if (title.length > 28) {
        courseTitle.classList.add('small');
    }

    courseCredits.innerHTML = `${credits} horas`;
    courseCredits.className = 'course-credits'

    course.appendChild(courseCode);
    course.appendChild(courseTitle);
    course.appendChild(courseCredits);

    return course;
}

const createGrid = _ => {

    while (curriculumContainer.firstChild) {
        curriculumContainer.removeChild(curriculumContainer.firstChild)
    }

    creditSum = 0;
    totalCredits = 0;

    const quarters = courses.reduce(function (memo, course) {
        if (!memo[course["quarter"]]) {
            memo[course["quarter"]] = [];
        }
        memo[course["quarter"]].push(course);
        return memo;
    }, {});

    const columns = [];

    for (const [i, q] of Object.entries(quarters)) {
        const col = document.createElement('div');
        col.className = 'curriculum-column';
        q.forEach(course => {
            col.appendChild(createCourseElement(course));
        });
        columns.push(col);
    }

    for (let c of columns) {
        curriculumContainer.appendChild(c);
    }

    let creditSpan = document.getElementById('credit-sum');
    let creditPercentage = document.getElementById('credit-percentage')
    creditSpan.innerText = creditSum;
    percentage = Math.round(creditSum / totalCredits * 100)
    creditPercentage.innerText = percentage

    if(percentage == 100) {
        triggerConfetti();
    }

}

const courseEventHandler = (course) => {

    const courseData = courses.find(c => course.id == c.id);

    if (!courseData.isCompleted) {
        const isRequirementsMet = getRequires(courseData).map(c => {
            if(isNaN(c)){
                return c.isCompleted;
            } else {
                return c <= creditSum;
            }
        });

        if (isRequirementsMet.every(c => c)) {
            
            course.classList.remove('available');
            course.classList.add('completed');
            courses.forEach(course => {
                if (course.id === courseData.id) {
                    course.isCompleted = true;                
                }});
            createGrid();
        } else {
            console.log(courseData.requires);
        }
    } else {
        courseData.isCompleted = false;
        unCompleteRequiredBy(courseData);
        createGrid();
    }
}

const isRequiredBy = (course) => {
    return courses.filter(c => c.requires.find(r => r === course.id));
}

const unCompleteRequiredBy = (course) => {
    isRequiredBy(course).forEach(r => {
        let c = courses.find(c => c.id === r.id);
        if(c.isCompleted){
            c.isCompleted = false;
            unCompleteRequiredBy(c);
        }
    });
}

const getRequires = (course) => {
    const result = course.requires.map(id => {
       
        if(isNaN(id)){
            return courses.find(c => c.id === id)
        }else{
            return id;
        }
    });
    return result;
}

const setCourseStatus = (id) => {

    const courseData = courses.find(c => c.id === id);
    if (courseData.isCompleted){ 
        creditSum = creditSum + courseData.credits;
        return 'completed';
    }
    const requires = getRequires(courseData);
    if (!requires.length) return 'available';
    if (requires.map(r => { 
        if (isNaN(r)) { 
            return r.isCompleted;
        } else {
            return r <= creditSum;
        }
    }).every(c => c))
        return 'available';
    else
        return 'blocked';

}

const triggerConfetti = () => {
    const count = 200,
  defaults = {
    origin: { y: 0.7 },
  };

function fire(particleRatio, opts) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
}

fire(0.25, {
  spread: 26,
  startVelocity: 55,
});

fire(0.2, {
  spread: 60,
});

fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8,
});

fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2,
});

fire(0.1, {
  spread: 120,
  startVelocity: 45,
});
}



loadJSON(response => {
    courses = JSON.parse(response);
}, actualCourse);


createGrid();