uniforms = {
  u_time: { value: 0 },
  u_mouse: { value: new THREE.Vector2() },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

window.addEventListener('mousemove', (event) => {
  // event.clientX / clientY gives pixel coordinates
  uniforms.u_mouse.value.x = event.clientX;
  uniforms.u_mouse.value.y = window.innerHeight - event.clientY; // flip Y axis
});
