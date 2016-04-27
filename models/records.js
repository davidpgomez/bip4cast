var mongoose =  require('mongoose');

var recordsSchema = mongoose.Schema({
    patientId : String,
    date : Date,
    eeag : Number,
    hdrs : {
        depr_mood : Number,
        feel_guilty : Number,
        suic : Number,
        inso_early : Number,
        inso_middle : Number,
        inso_late : Number,
        work_activ : Number,
        retard : Number,
        agitat : Number,
        anxi_psych : Number,
        anxi_somat : Number,
        somsympt_gastr : Number,
        somsympt_gener : Number,
        geni_sympt : Number,
        hypochon : Number,
        loss_weight : Number,
        insight : Number
    },
    ymrs : {
        elev_mood : Number,
        incr_act_ener : Number,
        sexu_inters : Number,
        sleep : Number,
        irritab : Number,
        speech : Number,
        lan_though_dis : Number,
        content : Number,
        dis_aggr_behav : Number,
        appearan : Number,
        insight : Number
    },
    panss_pos : {
            delsus : Number,
            concep_disor : Number,
            hallu_behav : Number,
            excitem : Number,
            grandios : Number,
            suspc : Number,
            hostil : Number
        },
    panss_neg : {
            blun_affec : Number,
            emot_withd : Number,
            poot_rapor : Number,
            pass_soc_withd : Number,
            diff_abst_thin : Number,
            lspont_convflow : Number,
            steo_think : Number
        },
    panss_gen : {
            soma_concer : Number,
            anxiet : Number,
            guilt_feels : Number,
            tension : Number,
            mann_post : Number,
            depress : Number,
            moto_retar : Number,
            uncoop : Number,
            unu_though : Number,
            disorient : Number,
            poor_atten : Number,
            ljud_insight : Number,
            dist_volit : Number,
            pinp_contr : Number,
            preoc : Number,
            asoc_avoid : Number
        },
});

var records = mongoose.model('records', recordsSchema);

module.exports = records;