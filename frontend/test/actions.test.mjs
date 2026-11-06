import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuickAction, buildQuickAction, supportedQuickActions} from '../.test-build/farhome/actions.js';

const services = {
  light: {toggle:{},turn_on:{},turn_off:{}},
  fan: {toggle:{},turn_on:{},turn_off:{},increase_speed:{},decrease_speed:{}},
  switch: {toggle:{},turn_on:{},turn_off:{}}, scene:{turn_on:{}}, script:{turn_on:{}},
};
const brightness = {mode:'restart',loop:false,loop_interval:250,sequence:[{action:'light.turn_on',target:{entity_id:'light.desk'},data:{brightness_step_pct:10,transition:0.1}}]};

test('known light step round trip preserves mode, step, transition and loop settings',()=>{
  const parsed = parseQuickAction(brightness);
  assert.equal(parsed.kind,'increase');assert.equal(parsed.step,10);
  assert.deepEqual(buildQuickAction(parsed),brightness);
});
test('delay, choose and unknown fields stay advanced without mutating input',()=>{
  const examples = [
    {mode:'single',sequence:[{delay:{seconds:1}},{action:'light.turn_on',target:{entity_id:'light.desk'}}]},
    {mode:'single',sequence:[{choose:[]}]},
    {...brightness, future_field:true},
    {...brightness,sequence:[{...brightness.sequence[0],continue_on_error:true}]},
    {...brightness,sequence:[{...brightness.sequence[0],data:{brightness_step_pct:10,extra:'preserve'}}]},
    {...brightness,sequence:[{...brightness.sequence[0],data:{brightness_step_pct:'10'}}]},
  ];
  for(const value of examples){const original=structuredClone(value);assert.equal(parseQuickAction(value),null);assert.deepEqual(value,original);}
});
test('service alias and action label round trip without canonicalizing data away',()=>{
  const action={mode:'queued',loop:true,loop_interval:80,sequence:[{service:'fan.increase_speed',alias:'Aria',target:{entity_id:'fan.air'},data:{percentage_step:15}}]};
  assert.deepEqual(buildQuickAction(parseQuickAction(action)),action);
});
test('fan offers speed only for SET_SPEED and available services, never brightness',()=>{
  const slow={entity_id:'fan.air',state:'off',attributes:{supported_features:48}};
  assert.deepEqual(supportedQuickActions(slow,services).map(x=>x.kind),['toggle','on','off']);
  const variable={...slow,attributes:{supported_features:49}};
  assert.deepEqual(supportedQuickActions(variable,services).map(x=>x.kind),['toggle','on','off','increase','decrease']);
  assert.deepEqual(supportedQuickActions(variable,{fan:{turn_on:{}}}).map(x=>x.kind),['on']);
});
test('onoff lights do not offer brightness steps',()=>{
  const entity={entity_id:'light.simple',state:'off',attributes:{supported_color_modes:['onoff']}};
  assert.deepEqual(supportedQuickActions(entity,services).map(x=>x.kind),['toggle','on','off']);
});
test('unavailable target remains the configured entity',()=>{
  const entity={entity_id:'fan.air',state:'unavailable',attributes:{supported_features:49}};
  assert.ok(supportedQuickActions(entity,services).some(x=>x.kind==='increase'));
  const action={domain:'fan',kind:'decrease',entity_id:entity.entity_id,step:10,mode:'restart'};
  assert.equal(buildQuickAction(action).sequence[0].target.entity_id,'fan.air');
});
test('scene and script build native HA actions',()=>{
  assert.deepEqual(buildQuickAction({domain:'scene',kind:'activate',entity_id:'scene.evening',mode:'single'}),{mode:'single',sequence:[{action:'scene.turn_on',target:{entity_id:'scene.evening'}}]});
  assert.deepEqual(buildQuickAction({domain:'script',kind:'run',entity_id:'script.night',mode:'single'}),{mode:'single',sequence:[{action:'script.turn_on',target:{entity_id:'script.night'}}]});
});
test('light on preserves brightness and Kelvin parameters',()=>{
  const value={mode:'single',sequence:[{action:'light.turn_on',target:{entity_id:'light.ceiling'},data:{brightness_pct:100,color_temp_kelvin:5609}}]};
  assert.deepEqual(buildQuickAction(parseQuickAction(value)),value);
});
test('invalid numeric values and HTML-like entity IDs cannot become actions',()=>{
  for(const step of [0,-10,101,NaN,Infinity])assert.throws(()=>buildQuickAction({domain:'fan',kind:'increase',entity_id:'fan.air',mode:'single',step}));
  assert.throws(()=>buildQuickAction({domain:'light',kind:'on',entity_id:'light.<img onerror=alert(1)>',mode:'single'}));
});
test('multiple entity, area targets and template expressions stay advanced',()=>{
  for(const target of [{entity_id:['light.desk']},{area_id:'room'},{entity_id:'{{ states("input_select.synthetic") }}'}]){
    assert.equal(parseQuickAction({mode:'single',sequence:[{action:'light.turn_on',target}]}),null);
  }
});
test('selector captures current light at the event and preserves independent advanced gestures',async()=>{
  const {buildSelectorAction,parseSelectorAction}=await import('../.test-build/farhome/actions.js');
  const feedback={mode:'restart',sequence:[{action:'light.toggle',target:{entity_id:'light.a'}},{delay:{milliseconds:500}},{action:'light.toggle',target:{entity_id:'light.a'}}]};
  const original=structuredClone(feedback);
  const down=buildSelectorAction('input_select.renamed','brightness_down',10,.1);
  assert.equal(down.sequence.at(-1).data.brightness_step_pct,-10);
  assert.equal(down.sequence.at(-1).data.transition,.1);
  assert.match(down.sequence[0].variables.farhome_selected_light,/states\('input_select.renamed'\)/);
  assert.deepEqual(parseSelectorAction(down),{helper_id:'input_select.renamed',kind:'brightness_down',step:10,transition:.1,mode:'restart'});
  assert.equal(parseSelectorAction(feedback),null);
  assert.deepEqual(feedback,original);
  assert.throws(()=>buildSelectorAction('input_select.bad\'id','next',10,.1));
});
